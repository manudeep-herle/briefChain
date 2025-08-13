const DEFAULT_WORKFLOWS = [
  {
    name: "React OSS Daily Brief",
    description: "Fetch GitHub stats, npm downloads, OpenSSF security score, summarize via AI, and deliver to Slack.",
    isActive: true,
    config: {
      steps: [
        {
          id: "s1",
          type: "github.repoSummary",
          name: "GitHub Repo Summary",
          params: {
            owner: "facebook",
            repo: "react",
          },
        },
        {
          id: "s2",
          type: "npm.downloads",
          name: "npm Downloads",
          params: {
            packageName: "react",
          },
        },
        {
          id: "s3",
          type: "openssf.scorecard",
          name: "OpenSSF Scorecard",
          params: {
            owner: "facebook",
            repo: "react",
          },
        },
        {
          id: "s4",
          type: "ai.summarizeBrief",
          name: "AI Summarizer",
          params: {},
        },
      ],
      secrets: {
        OPENAI_KEY: process.env.OPENAI_KEY || "",
        SLACK_WEBHOOK_URL: "",
      },
    },
  },
];

export default async function seedWorkflows(dataSource) {
  const workflowRepo = dataSource.getRepository("Workflow");
  const connectorRepo = dataSource.getRepository("Connector");
  
  for (const workflowData of DEFAULT_WORKFLOWS) {
    // Check if workflow already exists
    let workflow = await workflowRepo.findOne({ 
      where: { name: workflowData.name },
      relations: ["connectors"]
    });
    
    if (!workflow) {
      // Create new workflow
      workflow = workflowRepo.create(workflowData);
      workflow = await workflowRepo.save(workflow);
    } else {
      // Update existing workflow
      Object.assign(workflow, workflowData);
      workflow = await workflowRepo.save(workflow);
    }
    
    // Find connectors based on step types
    const stepTypes = workflowData.config.steps.map(step => step.type);
    const connectors = await connectorRepo.find({
      where: stepTypes.map(type => ({ key: type }))
    });
    
    // Link workflow to connectors (many-to-many)
    if (connectors.length > 0) {
      workflow.connectors = connectors;
      await workflowRepo.save(workflow);
    }
  }
  
  console.log(`Seeded ${DEFAULT_WORKFLOWS.length} workflows with connector relationships.`);
}
