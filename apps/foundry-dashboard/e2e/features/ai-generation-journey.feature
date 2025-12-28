# Critical User Journey: AI Content Generation
# Avatar: New Subscriber (post-authentication, has client set up)
# Priority: P0 (Core Value Proposition)
# Generated: 2025-12-27
#
# This feature describes the complete AI generation journey from source
# material upload through spoke generation with quality gates.
# Goal: User successfully generates high-quality content using the
# Hub-and-Spoke architecture with adversarial AI quality assurance.

@P0 @critical @generation @ai @journey
Feature: AI Content Generation Journey
  As a subscriber with a client set up
  I want to generate content using the Hub-and-Spoke engine
  So that I can produce 25+ platform-specific assets from a single source

  Background:
    Given I am logged in as a subscriber
    And I have at least one client created
    And the client has Brand DNA configured
    And I am in the active client context

  # =============================================================================
  # PHASE 1: SOURCE MATERIAL INGESTION
  # =============================================================================

  @ingestion @upload @P0
  Scenario: Upload PDF as source material
    Given I am on the Hub creation page
    When I drag and drop a PDF file onto the upload zone
    Then the file should upload to R2 storage
    And I should see a progress indicator
    And the file should appear with document icon and filename
    And the upload should complete within 10 seconds

  @ingestion @paste @P0
  Scenario: Paste transcript as source material
    Given I am on the Hub creation page
    When I click the "Paste Text" tab
    And I paste 2000 words of transcript content
    Then I should see a character count display
    And the content should be validated for minimum length
    And I should be able to proceed to the next step

  @ingestion @url
  Scenario: Provide URL for content scraping
    Given I am on the Hub creation page
    When I click the "URL" tab
    And I enter a valid article URL
    And I click "Fetch Content"
    Then the system should scrape the URL content
    And I should see extracted text preview
    And I should be able to edit before proceeding

  @ingestion @validation
  Scenario: Source material validation
    Given I have uploaded source material
    When the system validates the content
    Then I should see validation status:
      | Check          | Requirement          |
      | Word Count     | Minimum 500 words    |
      | Language       | Detected language    |
      | Content Type   | Article/Transcript   |
    And invalid content should show clear error message

  # =============================================================================
  # PHASE 2: THEMATIC EXTRACTION (Pillar Generation)
  # =============================================================================

  @extraction @pillars @P0
  Scenario: AI extracts content pillars from source
    Given I have provided valid source material
    When I click "Extract Themes"
    Then the extraction workflow should start
    And I should see processing stages:
      | Stage              | Description              |
      | Parsing            | Processing document...   |
      | Theme Detection    | Identifying themes...    |
      | Claim Extraction   | Extracting claims...     |
      | Pillar Generation  | Generating pillars...    |
    And extraction should complete within 30 seconds (NFR-P2)

  @extraction @pillars @results
  Scenario: View extracted pillars
    Given thematic extraction has completed
    When I view the pillar configuration step
    Then I should see 5-10 extracted pillars
    And each pillar should display:
      | Field               | Description                      |
      | Title               | Pillar name (editable)           |
      | Core Claim          | Main argument (editable)         |
      | Psychological Angle | Marketing psychology hook        |
      | Spoke Count         | Estimated spokes to generate     |

  @extraction @pillars @edit
  Scenario: Edit extracted pillar before generation
    Given I am viewing extracted pillars
    When I click on a pillar title
    And I modify the text
    Then the field should update immediately
    And a "Modified" badge should appear on that pillar
    And the original AI-generated value should be stored for comparison

  @extraction @pillars @remove
  Scenario: Remove unwanted pillar
    Given I am viewing extracted pillars
    When I click the remove button on a pillar
    Then a confirmation modal should appear
    And if I confirm, the pillar should be removed
    And the pillar count should update

  @extraction @pillars @add
  Scenario: Add custom pillar manually
    Given I am viewing extracted pillars
    When I click "Add Pillar"
    Then a new empty pillar form should appear
    And I should be able to enter:
      | Field               |
      | Title               |
      | Core Claim          |
      | Psychological Angle |
    And the pillar should be marked as "Manual"

  # =============================================================================
  # PHASE 3: HUB CREATION & CONFIGURATION
  # =============================================================================

  @hub @creation @P0
  Scenario: Finalize Hub with configured pillars
    Given I have configured my content pillars
    When I click "Create Hub"
    Then the Hub should be created in the database
    And a Durable Object should be initialized for this Hub
    And I should see a success celebration animation
    And I should see the "Start Generation" button

  @hub @metadata
  Scenario: Hub metadata is captured
    Given I am creating a Hub
    When the Hub is saved
    Then the following metadata should be stored:
      | Field           | Value                    |
      | Client ID       | Active client reference  |
      | Source Type     | PDF/Text/URL             |
      | Source URL      | Original source location |
      | Word Count      | Total words in source    |
      | Created At      | Timestamp                |
      | Status          | pending/generating/ready |

  # =============================================================================
  # PHASE 4: SPOKE GENERATION (Creator Agent)
  # =============================================================================

  @spoke @generation @P0
  Scenario: Trigger spoke generation for all platforms
    Given I have created a Hub with configured pillars
    When I click "Start Generation"
    Then spoke generation should begin for all pillars
    And I should see real-time progress via WebSocket
    And I should see generation status per platform:
      | Platform    | Target Count |
      | Twitter/X   | 5 per pillar |
      | LinkedIn    | 5 per pillar |
      | TikTok      | 5 per pillar |
      | Instagram   | 5 per pillar |
      | Newsletter  | 5 per pillar |

  @spoke @generation @realtime @P0
  Scenario: Real-time generation progress display
    Given spoke generation is in progress
    When I view the progress interface
    Then I should see:
      | Element          | Description                     |
      | Progress Bar     | Overall completion percentage   |
      | Spoke Counter    | X of Y spokes generated         |
      | Platform Status  | Per-platform progress           |
      | Time Elapsed     | Seconds since start             |
      | ETA              | Estimated completion time       |
    And the display should update every 500ms via WebSocket

  @spoke @generation @timing @P0
  Scenario: Generation completes within performance target
    Given spoke generation is in progress
    When 25 spokes per pillar are generated
    Then generation should complete within 60 seconds (NFR-P3)
    And all spokes should have initial quality scores

  @spoke @platforms
  Scenario: Platform-specific content formatting
    Given spokes have been generated
    When I view a Twitter/X spoke
    Then it should be formatted for 280 characters max
    And it should have appropriate hashtag suggestions

    When I view a LinkedIn spoke
    Then it should be formatted for professional audience
    And it should support up to 3000 characters

    When I view a TikTok spoke
    Then it should be a video script format
    And it should include hook, body, and CTA sections

  # =============================================================================
  # PHASE 5: QUALITY GATES (Critic Agent)
  # =============================================================================

  @quality @gates @P0
  Scenario: Quality gates evaluate each generated spoke
    Given spokes have been generated
    When I view the spoke list
    Then each spoke should display quality gate badges:
      | Gate | Type        | Display        |
      | G2   | Hook Score  | 0-100 number   |
      | G4   | Voice Match | Pass/Fail      |
      | G5   | Platform    | Pass/Fail      |
    And I should be able to hover for detailed scores

  @quality @G2 @hook
  Scenario: G2 Hook Strength scoring
    Given a spoke has been generated
    When the G2 gate evaluates it
    Then a Hook Strength score (0-100) should be assigned
    And scores 80+ should show green badge
    And scores 60-79 should show yellow badge
    And scores below 60 should show red badge
    And the score should be based on "Crack Bait" psychology principles

  @quality @G4 @voice
  Scenario: G4 Voice Alignment check
    Given a spoke has been generated
    And the client has Brand DNA configured
    When the G4 gate evaluates it
    Then the spoke should be checked against:
      | Check             | Source                    |
      | Voice Markers     | brand_stances table       |
      | Banned Words      | banned_words table        |
      | Tone Match        | Vectorize embeddings      |
    And a Pass/Fail result should be assigned
    And failed spokes should show which rule was violated

  @quality @G5 @platform
  Scenario: G5 Platform Compliance check
    Given a spoke has been generated
    When the G5 gate evaluates it
    Then the spoke should be checked against:
      | Platform   | Rules                           |
      | Twitter/X  | 280 char limit, no prohibited   |
      | LinkedIn   | Professional tone, 3000 char    |
      | TikTok     | Script format, hook timing      |
      | Instagram  | Caption length, emoji usage     |
    And a Pass/Fail result should be assigned

  @quality @G6 @visual
  Scenario: G6 Visual Cliche detection for image concepts
    Given a visual concept has been generated
    When the G6 gate evaluates it
    Then the system should detect AI visual cliches:
      | Cliche Type        | Examples                    |
      | Purple Gradients   | Typical AI art gradients    |
      | Floating Elements  | Disconnected floating items |
      | Generic Faces      | Uncanny valley faces        |
      | Stock Photo Style  | Generic corporate imagery   |
    And flagged visuals should show cliche warning

  # =============================================================================
  # PHASE 6: SELF-HEALING LOOP (Automatic Regeneration)
  # =============================================================================

  @selfhealing @loop @P0
  Scenario: Failed spoke triggers self-healing regeneration
    Given a spoke has failed quality gates
    When the self-healing loop activates
    Then the system should:
      | Step | Action                               |
      | 1    | Extract Critic feedback              |
      | 2    | Query past failures from SQLite      |
      | 3    | Regenerate with enhanced prompt      |
      | 4    | Re-evaluate through quality gates    |
    And the loop should complete within 10 seconds (NFR-P7)

  @selfhealing @attempts @P0
  Scenario: Self-healing retries up to 3 times
    Given a spoke has failed quality gates
    When self-healing attempts regeneration
    Then the system should try up to 3 regeneration loops
    And each attempt should incorporate previous feedback
    And the attempt counter should be visible to the user

  @selfhealing @success
  Scenario: Self-healing successfully improves spoke
    Given a spoke failed with G2 score of 45
    When the self-healing loop regenerates it
    And the new version scores G2 >= 70
    Then the spoke should be marked as healed
    And a "Self-Healed" badge should appear
    And the improvement delta should be recorded

  @selfhealing @escalation @P0
  Scenario: Persistent failure escalates to Creative Conflicts
    Given a spoke has failed 3 self-healing attempts
    When the system processes the escalation
    Then the spoke should be flagged for human review
    And it should appear in the "Creative Conflicts" bucket
    And the failure history should be preserved for context

  # =============================================================================
  # PHASE 7: CREATIVE CONFLICTS (Human-in-the-Loop)
  # =============================================================================

  @conflicts @bucket @P0
  Scenario: View Creative Conflicts requiring human decision
    Given spokes have failed self-healing
    When I navigate to /app/creative-conflicts
    Then I should see all escalated spokes
    And each conflict should show:
      | Element         | Description                    |
      | Spoke Content   | The generated text             |
      | Failure Reason  | Why it failed gates            |
      | Attempt History | 3 regeneration attempts        |
      | Gate Scores     | Current G2, G4, G5 scores      |

  @conflicts @actions @P0
  Scenario: Director's Cut actions for Creative Conflicts
    Given I am viewing a Creative Conflict
    When I see the action panel
    Then I should have these Director's Cut options:
      | Action          | Description                            |
      | Force Approve   | Override gates, approve as-is          |
      | Quick Edit      | Make minor text changes                |
      | Voice Calibrate | Record voice note to refine Brand DNA  |
      | Kill            | Permanently reject this spoke          |

  @conflicts @forceapprove
  Scenario: Force Approve overrides quality gates
    Given I am viewing a Creative Conflict spoke
    When I click "Force Approve"
    Then a confirmation modal should appear with:
      | Warning          | "This content scored below threshold"  |
      | Gate Scores      | Current failing scores                 |
      | Override Reason  | Optional text input                    |
    And if I confirm, the spoke should be approved
    And the approval should be logged with "Force Approved" flag

  @conflicts @voicecalibrate
  Scenario: Voice Calibrate triggers Brand DNA refinement
    Given I am viewing a Creative Conflict spoke
    When I click "Voice Calibrate"
    Then a voice recording interface should appear
    And I should see the prompt: "Explain why this doesn't match your brand"
    And after recording, the system should:
      | Step | Action                              |
      | 1    | Transcribe via Whisper              |
      | 2    | Extract new voice markers           |
      | 3    | Update Brand DNA embeddings         |
      | 4    | Regenerate the conflicted spoke     |

  # =============================================================================
  # PHASE 8: SPOKE HIERARCHY & ORGANIZATION
  # =============================================================================

  @hierarchy @tree
  Scenario: View Hub-Pillar-Spoke hierarchy
    Given I have a Hub with generated spokes
    When I navigate to the Hub detail page
    Then I should see a Tree Map visualization showing:
      | Level   | Display                           |
      | Hub     | Root node with Hub title          |
      | Pillars | Child nodes for each pillar       |
      | Spokes  | Leaf nodes grouped by platform    |

  @hierarchy @filter
  Scenario: Filter spokes by platform
    Given I am viewing a Hub with spokes
    When I click the platform filter
    And I select "LinkedIn"
    Then only LinkedIn spokes should be visible
    And the spoke count should update to show filtered count

  @hierarchy @filter @quality
  Scenario: Filter spokes by quality score
    Given I am viewing a Hub with spokes
    When I filter by "High Confidence" (G2 >= 80)
    Then only spokes with G2 score >= 80 should be visible
    And the filter badge should show the count

  # =============================================================================
  # COMPLETE JOURNEY: END-TO-END GENERATION HAPPY PATH
  # =============================================================================

  @journey @e2e @P0 @smoke
  Scenario: Complete AI Generation Journey - Happy Path
    # This scenario represents the full P0 critical generation path
    Given I am a subscriber with a client and Brand DNA set up

    # Phase 1: Source Ingestion
    When I navigate to Hub creation
    And I upload a PDF transcript (5000 words)
    Then the upload should complete successfully

    # Phase 2: Thematic Extraction
    When I click "Extract Themes"
    Then pillars should be extracted within 30 seconds
    And I should see 5-8 content pillars

    # Phase 3: Hub Creation
    When I review and optionally edit pillars
    And I click "Create Hub"
    Then the Hub should be created
    And I should see the generation button

    # Phase 4: Spoke Generation
    When I click "Start Generation"
    Then spoke generation should begin
    And I should see real-time progress
    And 25 spokes per pillar should generate within 60 seconds

    # Phase 5: Quality Gates
    Then all spokes should have G2, G4, G5 scores
    And at least 85% should pass all gates (Critic Pass Rate target)

    # Phase 6: Self-Healing
    And any failed spokes should attempt self-healing
    And self-healing should complete within 10 seconds per spoke

    # Phase 7: Creative Conflicts (if any)
    And persistent failures should appear in Creative Conflicts
    And I should be able to resolve them with Director's Cut

    # Journey Completion
    And the entire generation journey should complete within 3 minutes
    And there should be no console errors during the flow

  # =============================================================================
  # ERROR HANDLING SCENARIOS
  # =============================================================================

  @error @upload
  Scenario: Source upload fails gracefully
    Given I am uploading source material
    When the upload fails due to file too large (> 50MB)
    Then I should see error: "File exceeds 50MB limit"
    And I should see a "Try Again" button
    And partially uploaded data should be cleaned up

  @error @extraction
  Scenario: Extraction timeout handled gracefully
    Given source material is being processed
    When extraction exceeds 30 seconds
    Then I should see a timeout warning
    And I should have options:
      | Option         | Action                          |
      | Retry          | Restart extraction              |
      | Simplify       | Extract fewer pillars           |
      | Cancel         | Return to upload step           |

  @error @generation
  Scenario: Individual spoke generation failure
    Given spoke generation is in progress
    When a single spoke generation fails
    Then that spoke should be flagged with error status
    And other spokes should continue generating
    And I should be able to retry failed spokes individually

  @error @ai @unavailable
  Scenario: AI service unavailable (graceful degradation)
    Given I trigger spoke generation
    When the AI service is temporarily unavailable
    Then I should see: "AI generation temporarily unavailable"
    And my Hub configuration should be preserved
    And I should be able to retry when service recovers
    And this should not crash the application (NFR-R4)

  @error @websocket
  Scenario: WebSocket connection lost during generation
    Given spoke generation is in progress
    When the WebSocket connection is lost
    Then I should see a reconnection indicator
    And the system should automatically reconnect
    And progress should resume from last known state
    And no spokes should be lost

  # =============================================================================
  # PERFORMANCE VALIDATION SCENARIOS
  # =============================================================================

  @performance @NFR-P2
  Scenario: Hub ingestion meets 30-second target
    Given I have uploaded 10,000 words of source content
    When extraction begins
    Then it should complete within 30 seconds
    And the timing should be logged for monitoring

  @performance @NFR-P3
  Scenario: Spoke batch generation meets 60-second target
    Given I have a Hub with 5 pillars
    When I trigger generation (125 total spokes)
    Then generation should complete within 60 seconds
    And the per-spoke average should be recorded

  @performance @NFR-P7
  Scenario: Self-healing loop meets 10-second target
    Given a spoke has failed quality gates
    When self-healing activates
    Then each regeneration loop should complete within 10 seconds
    And total healing time should not exceed 30 seconds (3 attempts)
