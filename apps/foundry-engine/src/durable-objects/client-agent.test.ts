import { env, createExecutionContext, waitOnFinished, SELF } from 'cloudflare:test'
import { describe, it, expect, beforeEach } from 'vitest'
import { ClientAgent } from './client-agent'

describe('ClientAgent Durable Object', () => {
  it('should initialize schema on construction', async () => {
    const id = env.CLIENT_AGENT.idFromName('test-client')
    const agent = env.CLIENT_AGENT.get(id)
    
    // Call a method to ensure it's initialized
    const response = await agent.fetch(new Request('http://internal/rpc', {
      method: 'POST',
      body: JSON.stringify({ method: 'getBrandDNA', params: {} })
    }))
    
    const dna = await response.json()
    expect(dna).toHaveProperty('voiceMarkers')
    expect(dna.voiceMarkers).toBeInstanceOf(Array)
  })

  it('should implement Time-to-DNA and Drift Detection (placeholder)', async () => {
    // This will fail until implemented
    const id = env.CLIENT_AGENT.idFromName('test-client')
    const agent = env.CLIENT_AGENT.get(id)
    
    const response = await agent.fetch(new Request('http://internal/rpc', {
      method: 'POST',
      body: JSON.stringify({ method: 'getDNAReport', params: {} })
    }))
    
    const report = await response.json()
    // expect(report).toHaveProperty('timeToDNA') // Should be implemented
  })
})
