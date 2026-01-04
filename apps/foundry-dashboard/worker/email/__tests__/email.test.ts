import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Env } from '../../index';
import type { D1Database } from '@cloudflare/workers-types';

// Create mock send function that we can control in tests
const mockSend = vi.fn();

// Mock D1 database
const mockDbPrepare = vi.fn();
const mockDbFirst = vi.fn();
const mockDbRun = vi.fn();

const createMockDb = (): D1Database => {
  const mockDb = {
    prepare: mockDbPrepare,
  } as unknown as D1Database;

  // Chain methods for query building
  mockDbPrepare.mockReturnValue({
    bind: vi.fn().mockReturnValue({
      first: mockDbFirst,
      run: mockDbRun,
      all: vi.fn().mockResolvedValue({ results: [] }),
    }),
  });

  return mockDb;
};

// Mock the entire AWS SDK module before importing the email module
vi.mock('@aws-sdk/client-ses', () => {
  return {
    SESClient: class MockSESClient {
      send = mockSend;
    },
    SendEmailCommand: class MockSendEmailCommand {
      input: any;
      constructor(input: any) {
        this.input = input;
      }
    },
  };
});

// Now import after mocking
import { sendVerificationEmail, sendPasswordResetEmail, sendBrandDNAInvitation } from '../index';

describe('Email Service', () => {
  let mockEnv: Partial<Env>;
  let _mockDb: D1Database;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv = {
      AWS_ACCESS_KEY_ID: 'test-access-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      AWS_REGION: 'us-east-1',
      EMAIL_FROM: 'test@foundry.example.com',
      ENVIRONMENT: 'test',
    };
    _mockDb = createMockDb();

    // Default: no existing email log (idempotency check returns null)
    mockDbFirst.mockResolvedValue(null);
    // Default: database operations succeed
    mockDbRun.mockResolvedValue({ success: true, meta: { changes: 1 } });
    // Default successful SES response
    mockSend.mockResolvedValue({ MessageId: 'test-message-id' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should skip sending in dev mode when SES is not configured', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const envWithoutSES = { ENVIRONMENT: 'local' } as Env;

      const result = await sendVerificationEmail(
        envWithoutSES,
        { email: 'user@test.com', name: 'Test User' },
        'https://foundry.example.com/verify?token=abc123'
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SES not configured'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should call SES send when credentials are configured', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com', name: 'John Doe' },
        'https://foundry.example.com/verify?token=abc123'
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should include user name in email when provided', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com', name: 'John Doe' },
        'https://foundry.example.com/verify?token=abc123'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain('Hi John Doe');
    });

    it('should use fallback greeting when name is not provided', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify?token=abc123'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain('Hi there');
    });

    it('should include verification URL in email content', async () => {
      const verificationUrl = 'https://foundry.example.com/verify?token=abc123';
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com', name: 'Test' },
        verificationUrl
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain(verificationUrl);
      expect(commandArg?.input.Message.Body.Text.Data).toContain(verificationUrl);
    });

    it('should use correct subject line', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Subject.Data).toBe('Verify your Foundry account');
    });

    it('should use Midnight Command branding colors', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      const htmlContent = commandArg?.input.Message.Body.Html.Data;

      // Check Midnight Command color tokens
      expect(htmlContent).toContain('#0F1419'); // Background
      expect(htmlContent).toContain('#1A1F26'); // Surface
      expect(htmlContent).toContain('#2A3038'); // Border
      expect(htmlContent).toContain('#E7E9EA'); // Text Primary
      expect(htmlContent).toContain('#00D26A'); // Approve/CTA color
    });

    it('should return success when email sent', async () => {
      const result = await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      expect(result.success).toBe(true);
    });

    it('should NOT retry on failure - returns error immediately', async () => {
      // IMPORTANT: We removed retry logic to fix the triple-send bug.
      // Retrying email sends is dangerous because if SES accepts the request
      // but the response times out, retrying sends duplicate emails.
      mockSend.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      // Should only call once - no retries!
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');

      consoleSpy.mockRestore();
    });

    it('should log error when send fails (no retry)', async () => {
      mockSend.mockRejectedValue(new Error('SES timeout'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Email send failed (no retry):',
        expect.objectContaining({ error: 'SES timeout' })
      );

      consoleSpy.mockRestore();
    });

    it('should send to correct recipient email', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'recipient@example.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Destination.ToAddresses).toContain('recipient@example.com');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should skip sending in dev mode when SES is not configured', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const envWithoutSES = { ENVIRONMENT: 'local' } as Env;

      const result = await sendPasswordResetEmail(
        envWithoutSES,
        { email: 'user@test.com', name: 'Test User' },
        'https://foundry.example.com/reset?token=xyz789'
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SES not configured'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should use correct subject line for password reset', async () => {
      await sendPasswordResetEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/reset'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Subject.Data).toBe('Reset your Foundry password');
    });

    it('should use blue Edit color for reset button', async () => {
      await sendPasswordResetEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/reset'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      const htmlContent = commandArg?.input.Message.Body.Html.Data;

      // Password reset should use Edit blue color
      expect(htmlContent).toContain('#1D9BF0');
    });

    it('should include reset URL in email content', async () => {
      const resetUrl = 'https://foundry.example.com/reset?token=xyz789';
      await sendPasswordResetEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        resetUrl
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain(resetUrl);
      expect(commandArg?.input.Message.Body.Text.Data).toContain(resetUrl);
    });

    it('should mention 1 hour expiry in content', async () => {
      await sendPasswordResetEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/reset'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain('1 hour');
      expect(commandArg?.input.Message.Body.Text.Data).toContain('1 hour');
    });

    it('should include security notice about ignoring unwanted resets', async () => {
      await sendPasswordResetEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/reset'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      const htmlContent = commandArg?.input.Message.Body.Html.Data;
      expect(htmlContent).toContain("didn't request a password reset");
    });
  });

  describe('sendBrandDNAInvitation', () => {
    it('should skip sending in dev mode when SES is not configured', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const envWithoutSES = { ENVIRONMENT: 'local' } as Env;

      const result = await sendBrandDNAInvitation(
        envWithoutSES,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Email Mock] Sending Brand DNA Invite')
      );

      consoleSpy.mockRestore();
    });

    it('should include tokenId in mock log when provided', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const envWithoutSES = { ENVIRONMENT: 'local' } as Env;

      await sendBrandDNAInvitation(
        envWithoutSES,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency',
        'test-token-123'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('test-token-123')
      );

      consoleSpy.mockRestore();
    });

    it('should log tokenId when sending email for traceability', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency',
        'trace-token-456'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Email] Sending Brand DNA Invite - token: trace-token-456'
      );

      consoleSpy.mockRestore();
    });

    it('should call SES send when credentials are configured', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('should use correct subject line with agency name', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Subject.Data).toBe('Super Agency invited you to set up your brand voice');
    });

    it('should include client name in email content', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain('Acme Corp');
    });

    it('should include agency name in email content', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain('Super Agency');
    });

    it('should include invite URL in email content', async () => {
      const inviteUrl = 'https://foundry.example.com/brand-dna/abc123';
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        inviteUrl,
        'Super Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain(inviteUrl);
      expect(commandArg?.input.Message.Body.Text.Data).toContain(inviteUrl);
    });

    it('should send to correct recipient email', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Destination.ToAddresses).toContain('client@test.com');
    });

    it('should escape HTML in client and agency names', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        '<script>alert("xss")</script>',
        'https://foundry.example.com/brand-dna/abc123',
        '<b>Malicious</b> Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      const htmlContent = commandArg?.input.Message.Body.Html.Data;
      expect(htmlContent).not.toContain('<script>');
      expect(htmlContent).toContain('&lt;script&gt;');
    });

    it('should include voice recording instruction in content', async () => {
      await sendBrandDNAInvitation(
        mockEnv as Env,
        'client@test.com',
        'Acme Corp',
        'https://foundry.example.com/brand-dna/abc123',
        'Super Agency'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html.Data).toContain('voice note');
    });
  });

  describe('Email template structure', () => {
    it('should include proper HTML structure', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      const htmlContent = commandArg?.input.Message.Body.Html.Data;

      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html lang="en">');
      expect(htmlContent).toContain('The Agentic Content Foundry');
    });

    it('should include footer with support info', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      const htmlContent = commandArg?.input.Message.Body.Html.Data;

      expect(htmlContent).toContain('support@williamjshaw.ca');
    });

    it('should use FROM address from environment', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Source).toBe('test@foundry.example.com');
    });

    it('should include both HTML and plain text versions', async () => {
      await sendVerificationEmail(
        mockEnv as Env,
        { email: 'user@test.com' },
        'https://foundry.example.com/verify'
      );

      const commandArg = mockSend.mock.calls[0]?.[0];
      expect(commandArg?.input.Message.Body.Html).toBeDefined();
      expect(commandArg?.input.Message.Body.Text).toBeDefined();
      expect(commandArg?.input.Message.Body.Html.Charset).toBe('UTF-8');
      expect(commandArg?.input.Message.Body.Text.Charset).toBe('UTF-8');
    });
  });
});
