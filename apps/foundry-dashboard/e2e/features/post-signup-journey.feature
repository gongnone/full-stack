# Critical User Journey: Post-Signup Activation
# Avatar: New Subscriber (post-authentication)
# Priority: P0 (Core Activation Path)
# Generated: 2025-12-27
#
# This feature describes the complete journey for a newly signed-up user
# from first dashboard load through content production and approval.
# Goal: User creates their first client, hub, and approved spoke.

@P0 @critical @activation @journey
Feature: Post-Signup Activation Journey
  As a newly signed-up user
  I want to create my first client, hub, and content
  So that I can experience the Executive Producer workflow

  Background:
    Given I am logged in as a new subscriber
    And I have not created any clients yet
    And the dashboard is accessible

  # =============================================================================
  # PHASE 1: Dashboard Onboarding
  # =============================================================================

  @onboarding @dashboard
  Scenario: New subscriber sees empty state dashboard
    Given I am on the dashboard for the first time
    When the page loads
    Then I should see the sidebar with navigation items:
      | Item      |
      | Dashboard |
      | Hubs      |
      | Review    |
      | Clients   |
      | Analytics |
      | Settings  |
    And I should see an empty state with "Create Your First Client" CTA
    And the page should load within 3 seconds (NFR-P5)

  @onboarding @navigation
  Scenario: New subscriber can access command palette
    Given I am on the dashboard
    When I press Cmd+K
    Then I should see the command palette open
    And I should see quick actions for getting started

  # =============================================================================
  # PHASE 2: Create First Client
  # =============================================================================

  @client @creation @P0
  Scenario: New subscriber creates their first client
    Given I am on the dashboard with no clients
    When I click "Create Your First Client"
    Then I should see the client creation form
    And I should see fields for:
      | Field         | Required |
      | Client Name   | Yes      |
      | Industry      | No       |
      | Contact Email | No       |
      | Brand Color   | No       |

  @client @creation @P0
  Scenario: New subscriber completes client creation
    Given I am on the client creation form
    When I enter "Acme Corp" as the client name
    And I select "Technology" as the industry
    And I click "Create Client"
    Then the client should be created in the database
    And I should be redirected to the client workspace
    And I should see "Acme Corp" in the header as active context
    And the Durable Object should be initialized for this client

  @client @context
  Scenario: Active client indicator is visible
    Given I have created a client "Acme Corp"
    When I navigate to any page
    Then I should see the client name in the header
    And I should see a colored border matching the client's brand color

  # =============================================================================
  # PHASE 3: Brand DNA Setup (Optional but Recommended)
  # =============================================================================

  @brand-dna @setup
  Scenario: New subscriber sees Brand DNA onboarding prompt
    Given I have created my first client
    When I view the client workspace
    Then I should see a prompt to "Set Up Brand DNA"
    And I should see explanation: "Help the AI learn your voice"

  @brand-dna @upload
  Scenario: New subscriber uploads content for brand analysis
    Given I am on the Brand DNA page
    When I drag and drop a PDF file
    Then the file should upload to R2 storage
    And I should see a progress indicator
    And the file should appear in "Training Samples" list

  @brand-dna @text-input
  Scenario: New subscriber provides text content for analysis
    Given I am on the Brand DNA page
    When I click "Paste Text" tab
    And I paste sample content text
    And I click "Add Sample"
    Then the content should be saved as a training sample
    And it should appear with "Pasted Text" source type

  @brand-dna @analysis @P0
  Scenario: Brand DNA analysis generates report
    Given I have uploaded at least 3 training samples
    When the analysis completes
    Then I should see a Brand DNA Report with:
      | Metric           | Display          |
      | DNA Strength     | Percentage score |
      | Primary Tone     | Detected value   |
      | Signature Phrases| List of phrases  |
    And the analysis should complete within 2 minutes (NFR-P6)

  @brand-dna @voice-markers
  Scenario: New subscriber can edit voice markers
    Given the Brand DNA analysis is complete
    When I click "Edit Voice Markers"
    Then I should see current markers as editable chips
    And I should be able to add new phrases
    And I should be able to remove phrases

  # =============================================================================
  # PHASE 4: Create First Hub
  # =============================================================================

  @hub @creation @wizard
  Scenario: New subscriber starts hub creation wizard
    Given I have a client set up
    When I navigate to /app/hubs/new
    Then I should see a 4-step wizard:
      | Step | Name              |
      | 1    | Select Client     |
      | 2    | Upload Source     |
      | 3    | Configure Pillars |
      | 4    | Generate          |

  @hub @upload @P0
  Scenario: New subscriber uploads source material
    Given I am on Step 2 of the hub wizard
    When I drag and drop a PDF file
    Then the file should upload to R2
    And I should see the filename with document icon

  @hub @upload
  Scenario: New subscriber pastes text as source
    Given I am on Step 2 of the hub wizard
    When I click "Paste Text" tab
    And I paste transcript content
    Then I should see character count
    And I should be able to proceed to Step 3

  @hub @extraction @P0
  Scenario: Thematic extraction identifies pillars
    Given I have uploaded source material
    When the extraction workflow runs
    Then I should see processing animation with stages:
      | Stage              |
      | Parsing document   |
      | Identifying themes |
      | Extracting claims  |
      | Generating pillars |
    And pillars should appear within 30 seconds (NFR-P2)
    And I should see 5-10 suggested pillars

  @hub @pillars
  Scenario: New subscriber configures pillars
    Given pillars have been extracted
    When I view Step 3 (Configure Pillars)
    Then I should see all pillars in an editable list
    And each pillar should have:
      | Field             |
      | Title             |
      | Core Claim        |
      | Psychological Angle |

  @hub @pillars @edit
  Scenario: New subscriber modifies a pillar
    Given I am on the pillar configuration step
    When I edit a pillar title
    Then the change should be reflected immediately
    And a "Modified" badge should appear

  @hub @creation @complete @P0
  Scenario: New subscriber finalizes hub creation
    Given I have configured my pillars
    When I click "Create Hub"
    Then the Hub should be created in the database
    And I should see a success celebration animation
    And I should see "Start Generation" button

  # =============================================================================
  # PHASE 5: Generate First Spokes
  # =============================================================================

  @spoke @generation @P0
  Scenario: New subscriber triggers spoke generation
    Given I have created a Hub with configured pillars
    When I click "Start Generation"
    Then spoke generation should begin
    And I should see real-time progress via WebSocket
    And 25 spokes per pillar should be generated within 60 seconds (NFR-P3)

  @spoke @generation @platforms
  Scenario: Spokes are generated for multiple platforms
    Given spoke generation is in progress
    When generation completes
    Then I should see spokes for each platform:
      | Platform    |
      | Twitter/X   |
      | LinkedIn    |
      | TikTok      |
      | Instagram   |
      | Newsletter  |
    And each spoke should have platform-appropriate formatting

  @spoke @quality-gates @P0
  Scenario: Quality gates evaluate each spoke
    Given spokes have been generated
    When I view the spoke list
    Then each spoke should have quality gate badges:
      | Gate | Type      |
      | G2   | Score 0-100 |
      | G4   | Pass/Fail |
      | G5   | Pass/Fail |
    And I should be able to hover for detailed scores

  @spoke @self-healing @P0
  Scenario: Self-healing loop automatically improves failed content
    Given a spoke fails quality gates
    When the self-healing loop activates
    Then the system should regenerate the spoke
    And incorporate Critic feedback
    And complete within 10 seconds per loop (NFR-P7)
    And retry up to 3 times before escalating

  @spoke @creative-conflict
  Scenario: Failed spokes escalate to Creative Conflicts
    Given a spoke has failed 3 self-healing attempts
    When I view the dashboard
    Then the spoke should appear in "Creative Conflicts" bucket
    And I should see Director's Cut options:
      | Action         |
      | Force Approve  |
      | Quick Edit     |
      | Voice Calibrate|
      | Kill           |

  # =============================================================================
  # PHASE 6: Review and Approve Content
  # =============================================================================

  @review @sprint @P0
  Scenario: New subscriber enters Sprint Mode
    Given I have spokes ready for review
    When I navigate to /app/review
    And I click "Start Sprint"
    Then I should enter Sprint Mode
    And I should see content cards with Signal Header (G2+G7 48px)

  @review @sprint @signal-header
  Scenario: Sprint view shows quality signals
    Given I am in Sprint Mode
    When I view a content card
    Then I should see:
      | Element         | Description                    |
      | G2 Score        | Hook strength in 48px          |
      | G7 Score        | Engagement prediction in 48px  |
      | Context Bar     | Client > Platform > Hub > Pillar |
      | Content Preview | Full text with formatting      |
      | Gate Status     | G4 and G5 badges               |
      | Action Bar      | Kill, Edit, Approve buttons    |

  @review @keyboard @P0
  Scenario: New subscriber approves content via keyboard
    Given I am in Sprint Mode
    When I press the Right Arrow key
    Then the current spoke should be approved
    And a green flash animation should play
    And the next spoke should slide in
    And the counter should increment
    And the action should complete within 200ms (NFR-P4)

  @review @keyboard
  Scenario: New subscriber kills content via keyboard
    Given I am in Sprint Mode
    When I press the Left Arrow key
    Then the current spoke should be killed
    And a red flash animation should play
    And the spoke should be marked as rejected

  @review @keyboard
  Scenario: New subscriber skips content via keyboard
    Given I am in Sprint Mode
    When I press Space
    Then the current spoke should move to end of queue
    And a yellow flash should play

  @review @hub-kill
  Scenario: New subscriber uses Hub Kill
    Given I am reviewing a spoke
    When I hold H for 500ms
    Then I should see confirmation modal with:
      | Element      | Content                          |
      | Hub Title    | Name of the hub                  |
      | Spoke Count  | Number of affected spokes        |
      | Warning      | "Can be undone within 30 seconds"|
    And I should see Cancel and Confirm Kill buttons

  @review @hub-kill @cascade
  Scenario: Hub Kill cascades to all children
    Given I confirm a Hub Kill
    When the cascade executes
    Then all child spokes should be marked as killed
    And I should see Pillar Pruning Animation
    And I should see undo toast for 30 seconds

  @review @mutation-rule
  Scenario: Manually edited spokes survive Hub Kill
    Given I have manually edited a spoke
    And its parent Hub is killed
    Then the edited spoke should survive
    And it should be moved to "Manual Assets" category

  # =============================================================================
  # PHASE 7: Executive Producer Report
  # =============================================================================

  @report @completion @P0
  Scenario: New subscriber sees Executive Producer Report
    Given I have completed all items in a sprint
    When the Batch Complete state loads
    Then I should see:
      | Metric             | Display                   |
      | Time Saved         | Hours saved in 64px       |
      | Dollar Value       | Monetary equivalent       |
      | Items Reviewed     | Total count               |
      | Approved           | Count and percentage      |
      | Killed             | Count and percentage      |
      | Zero-Edit Rate     | Percentage with target    |
      | Avg Decision Time  | Seconds per decision      |

  @report @actions
  Scenario: Report provides next action options
    Given I am viewing the Executive Producer Report
    When I see the action buttons
    Then I should see:
      | Action          |
      | Export Calendar |
      | Share Links     |
      | Review Conflicts|
      | Dashboard       |

  # =============================================================================
  # COMPLETE JOURNEY: End-to-End Happy Path
  # =============================================================================

  @journey @e2e @P0 @smoke
  Scenario: Complete Post-Signup Journey - Happy Path
    # This scenario represents the full P0 critical activation path
    Given I am a newly signed-up user with no clients

    # Phase 1: Dashboard Onboarding
    When I log in to the dashboard
    Then I should see the empty state with onboarding prompt

    # Phase 2: Create First Client
    When I create a client named "My First Client"
    Then the client should be created
    And I should see the client workspace

    # Phase 3: Brand DNA (Optional - skip for speed)
    # Skip for smoke test - covered in separate scenarios

    # Phase 4: Create First Hub
    When I start the hub creation wizard
    And I upload a source document
    And I wait for pillar extraction
    And I click "Create Hub"
    Then the Hub should be created
    And pillars should be visible

    # Phase 5: Generate Spokes
    When I click "Start Generation"
    And I wait for spoke generation to complete
    Then I should see generated spokes with quality scores

    # Phase 6: Review and Approve
    When I enter Sprint Mode
    And I approve at least 3 spokes using keyboard
    Then the spokes should be marked as approved

    # Phase 7: Completion
    And the entire journey should complete within 5 minutes
    And there should be no console errors during the flow

  # =============================================================================
  # ERROR HANDLING SCENARIOS
  # =============================================================================

  @error @upload
  Scenario: Source upload fails gracefully
    Given I am uploading source material
    When the upload fails due to network error
    Then I should see an error message
    And I should see a "Retry" button
    And partial progress should be preserved

  @error @extraction
  Scenario: Pillar extraction timeout handled
    Given source material is being processed
    When extraction exceeds 30 seconds
    Then I should see a timeout warning
    And I should have option to retry or proceed with partial results

  @error @generation
  Scenario: Spoke generation failure handled
    Given spoke generation is in progress
    When a generation error occurs
    Then the failed spoke should be flagged
    And other spokes should continue generating
    And I should be able to retry failed spokes
