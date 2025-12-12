import { Workflow } from 'cloudflare:workers';

declare global {
    interface ServiceBindings extends Env {
        HALO_RESEARCH_WORKFLOW: Workflow;
    }
}
