# Critical User Journey: New Subscriber
# Avatar: New Subscriber
# Priority: P0 (Core Revenue Path)
# Generated: 2025-12-27
#
# This feature describes the complete journey for a new user discovering
# the Foundry product, authenticating via Google OAuth, and purchasing
# a subscription to unlock premium features.

@P0 @critical @revenue @journey
Feature: New Subscriber Journey
  As a new visitor discovering Foundry
  I want to sign up and purchase a subscription
  So that I can access premium content generation features

  Background:
    Given the Foundry landing page is accessible
    And payment processing is enabled
    And Google OAuth is configured

  # =============================================================================
  # PHASE 1: Discovery - Landing Page Experience
  # =============================================================================

  @landing @discovery
  Scenario: New visitor lands on the homepage
    Given I am a new visitor with no prior account
    When I navigate to the Foundry landing page
    Then I should see the hero section with value proposition
    And I should see a prominent "Get Started" call-to-action
    And I should see pricing information or "View Pricing" link
    And the page should load within 3 seconds (NFR-P5)

  @landing @pricing
  Scenario: New visitor explores pricing options
    Given I am on the Foundry landing page
    When I click on "View Pricing" or scroll to pricing section
    Then I should see at least one subscription tier
    And each tier should display:
      | Element      | Required |
      | Price        | Yes      |
      | Billing Cycle| Yes      |
      | Features     | Yes      |
      | CTA Button   | Yes      |
    And I should see a "Subscribe" or "Start Free Trial" button

  # =============================================================================
  # PHASE 2: Authentication - Google OAuth Flow
  # =============================================================================

  @auth @google-oauth @P0
  Scenario: New subscriber initiates Google OAuth login
    Given I am on the Foundry landing page
    And I am not logged in
    When I click "Get Started" or "Sign Up"
    Then I should be redirected to the login page
    And I should see a "Continue with Google" button
    And I should see alternative email/password sign up option

  @auth @google-oauth @P0
  Scenario: New subscriber completes Google OAuth authentication
    Given I am on the login page
    When I click "Continue with Google"
    Then I should be redirected to Google's OAuth consent screen

    When I select my Google account
    And I grant consent to Foundry
    Then I should be redirected back to Foundry
    And a new user account should be created
    And I should be logged in with my Google identity
    And I should see the dashboard or onboarding flow

  @auth @google-oauth @error
  Scenario: Google OAuth is cancelled by user
    Given I am on the login page
    When I click "Continue with Google"
    And I am redirected to Google's OAuth consent screen
    When I click "Cancel" or close the OAuth window
    Then I should be returned to the Foundry login page
    And I should see a message indicating login was cancelled
    And I should be able to try again

  @auth @google-oauth @error
  Scenario: Google OAuth fails due to network error
    Given I am on the login page
    When I click "Continue with Google"
    And the OAuth request fails due to network error
    Then I should see an error message
    And I should be able to retry the login

  # =============================================================================
  # PHASE 3: Subscription Purchase Flow
  # =============================================================================

  @subscription @purchase @P0
  Scenario: Authenticated user views subscription options
    Given I am logged in as a new user without a subscription
    When I navigate to the subscription page
    Then I should see available subscription plans
    And I should see my current plan status as "Free" or "No Plan"
    And I should see a "Subscribe" or "Upgrade" button

  @subscription @purchase @P0
  Scenario: New subscriber selects a subscription plan
    Given I am logged in as a new user without a subscription
    And I am on the subscription page
    When I select the "Pro" plan
    And I click "Subscribe"
    Then I should be taken to the payment checkout
    And the selected plan details should be visible
    And the price should match the displayed tier price

  @subscription @stripe @P0
  Scenario: New subscriber completes payment with Stripe
    Given I am on the payment checkout page
    And I have selected the "Pro" plan
    When I enter valid payment details:
      | Field           | Value               |
      | Card Number     | 4242424242424242    |
      | Expiry          | 12/30               |
      | CVC             | 123                 |
      | Billing Name    | Test User           |
      | Billing Country | United States       |
    And I click "Complete Purchase"
    Then the payment should be processed successfully
    And I should see a confirmation message
    And my subscription status should update to "Pro"
    And I should receive a confirmation email

  @subscription @stripe @error
  Scenario: Payment fails due to declined card
    Given I am on the payment checkout page
    And I have selected the "Pro" plan
    When I enter a declined card number "4000000000000002"
    And I click "Complete Purchase"
    Then the payment should be declined
    And I should see an error message "Your card was declined"
    And I should be able to enter different payment details
    And my subscription status should remain unchanged

  @subscription @stripe @error
  Scenario: Payment fails due to insufficient funds
    Given I am on the payment checkout page
    When I enter a card with insufficient funds "4000000000009995"
    And I click "Complete Purchase"
    Then the payment should fail with "Insufficient funds"
    And I should see options to use a different payment method

  # =============================================================================
  # PHASE 4: Post-Purchase Experience
  # =============================================================================

  @subscription @activation @P0
  Scenario: New subscriber accesses premium features after purchase
    Given I have just completed a "Pro" subscription purchase
    When I am redirected to the dashboard
    Then I should see a welcome message for Pro subscribers
    And premium features should be unlocked:
      | Feature                    | Status   |
      | Unlimited Hubs             | Enabled  |
      | Advanced Voice Calibration | Enabled  |
      | Export to All Formats      | Enabled  |
      | Priority Queue             | Enabled  |
    And I should see my subscription status as "Pro"

  @subscription @activation
  Scenario: New subscriber can immediately use premium features
    Given I am a newly subscribed "Pro" user
    When I navigate to "Create New Hub"
    Then I should not see any upgrade prompts or limitations
    And I should have access to all Pro-tier source types
    And I should be able to generate content without restrictions

  @subscription @billing
  Scenario: New subscriber can view billing details
    Given I am a subscribed "Pro" user
    When I navigate to Settings > Billing
    Then I should see my current plan "Pro"
    And I should see the next billing date
    And I should see payment method on file (last 4 digits)
    And I should see options to:
      | Action                  |
      | Update Payment Method   |
      | View Billing History    |
      | Cancel Subscription     |

  # =============================================================================
  # COMPLETE JOURNEY: End-to-End Happy Path
  # =============================================================================

  @journey @e2e @P0 @smoke
  Scenario: Complete New Subscriber Journey - Happy Path
    # This scenario represents the full P0 critical path
    Given I am a new visitor with no prior account

    # Phase 1: Discovery
    When I navigate to the Foundry landing page
    Then I should see the hero section with value proposition

    # Phase 2: Authentication
    When I click "Get Started"
    And I click "Continue with Google"
    And I complete Google OAuth authentication
    Then I should be logged in and see the dashboard

    # Phase 3: Purchase
    When I navigate to the subscription page
    And I select the "Pro" plan
    And I complete payment with valid card details
    Then I should see subscription confirmation

    # Phase 4: Activation
    And my account should show "Pro" status
    And I should have access to all premium features

    # NFR Validation
    And the entire journey should complete within 60 seconds
    And there should be no console errors during the flow
