const QUESTIONS = [
  {
    "id": 1,
    "category": "Career & behavioral",
    "title": "Tell me about yourself.",
    "simple": "Give a short story of your career: years of experience, your main tools, one strong project, and what you want next.",
    "answer": "I’m a Platform Engineer with about five years of experience supporting cloud platforms in automotive and healthcare. At Rally Health, I worked mainly with AWS, Terraform, Docker, Lambda, GitHub Actions, and CloudWatch, focusing on automation and reliable infrastructure. At vAuto, I work more deeply with AWS, EKS, Kubernetes, Terraform, Helm, GitHub Actions, and Datadog, supporting multiple engineering teams. Recently, I built an AI-assisted pull-request review workflow using Claude Code and GitHub MCP to help catch infrastructure risks such as overly broad IAM permissions, Terraform drift, and unsafe Helm changes before production. I enjoy making platforms safer and easier for developers to use, and I’m looking to keep growing in platform engineering and practical AI-assisted operations.",
    "example": "Use the real progression: Rally Health → vAuto. Mention the AI PR reviewer as a headline, then pause and let the interviewer choose a follow-up.",
    "followups": [
      "Which project are you most proud of?",
      "What did you personally build versus what did the team build?",
      "What are your strongest technical skills?"
    ],
    "terms": [
      "Platform engineering: building shared tools and infrastructure that help developers ship safely.",
      "EKS: AWS-managed Kubernetes control plane.",
      "IaC: Infrastructure as Code; defining infrastructure in version-controlled files."
    ]
  },
  {
    "id": 2,
    "category": "Terraform & automation",
    "title": "What is the highest-impact infrastructure automation project you delivered end-to-end, and how did you measure success?",
    "simple": "Describe a real problem, what you automated, how you built it, and what improved. Be clear about which results are verified in your own experience.",
    "answer": "At Rally Health, I helped standardize cloud provisioning with reusable Terraform modules and GitHub Actions. The goal was to reduce repeated manual setup and make infrastructure changes easier to review and reproduce. We separated environment configuration, used pull requests to review plans, and applied changes through controlled workflows instead of relying on ad-hoc laptop commands. At vAuto, I’ve continued that approach across EKS and shared platform components. I measure success using practical signals: fewer manual steps, more consistent environments, faster reviews, and fewer avoidable deployment issues. I’d only quote a percentage or time saving when I can explain how it was measured.",
    "example": "For an interview, pick one concrete module or workflow and explain the before/after. Don’t claim the PDF’s example metrics as your own unless they are true for your experience.",
    "followups": [
      "How did you handle Terraform state and locking?",
      "How did you separate dev, staging, and production?",
      "How did you prevent an unsafe apply?"
    ]
  },
  {
    "id": 3,
    "category": "AI & automation",
    "title": "How do you leverage LLM-based coding assistants in your daily DevOps workflows?",
    "simple": "Explain where AI helps, how you constrain it, and how you verify its work before it can affect production.",
    "answer": "I use Claude Code as an assistant for infrastructure review and troubleshooting, not as an unchecked production operator. At vAuto, I built an AI-assisted PR review workflow with GitHub MCP across infrastructure repositories. It checks Terraform changes for issues such as overly broad IAM permissions, duplicate resources, naming or tagging problems, and it reviews Helm and Kubernetes changes for risks such as RBAC, ingress routing, and resource settings. I treat the output as a reviewer’s signal, not as proof: normal CI checks and human review still apply, and production changes go through the established approval path. The value is catching issues earlier and reducing repetitive review work while keeping engineering accountability with people.",
    "example": "A Terraform PR grants a role wildcard permissions. The reviewer flags it, points to the changed policy, and asks for resource-scoped actions before merge.",
    "followups": [
      "How do you stop prompt injection from repository content?",
      "What can the agent read or change?",
      "How do you measure false positives and missed issues?"
    ]
  },
  {
    "id": 4,
    "category": "Kubernetes & releases",
    "title": "What is the difference between blue-green, canary, and rolling deployment? Which would you choose?",
    "simple": "These are three ways to introduce a new application version while controlling risk.",
    "answer": "A rolling deployment replaces old pods gradually with new pods. It is resource-efficient and is a common Kubernetes default, but both versions may serve traffic during the rollout. Blue-green keeps two environments: blue is live, green is tested, and traffic switches when green is ready. Rollback can be fast, but temporarily running both environments costs more. Canary sends a small portion of real traffic to the new version, then increases it if error rate and latency remain healthy. For routine low-risk releases I’d usually use rolling updates. For high-risk changes needing a quick traffic switch, I’d consider blue-green. For changes where production behavior is uncertain and traffic splitting is available, I’d consider canary.",
    "example": "A routine API image update can use rolling deployment with readiness probes. A major routing change may need a staged rollout and explicit rollback plan.",
    "followups": [
      "What metrics would stop a canary?",
      "How do readiness probes affect rolling updates?",
      "What is the cost trade-off of blue-green?"
    ]
  },
  {
    "id": 5,
    "category": "Incidents & reliability",
    "title": "A production pipeline fails halfway through a release after database migrations have run. How do you triage and fix it?",
    "simple": "Stop additional changes, find out exactly what changed, protect the data, then choose a safe rollback or roll-forward.",
    "answer": "First I would stop the pipeline from making further changes and communicate that we’re investigating a production release issue. I’d check the application rollout and pod health, compare the Terraform plan with what actually applied, and confirm which database migrations completed. I would not automatically roll back the database because schema changes may not be reversible. If the migration is backward-compatible, I can usually restore the previous application version while leaving the additive schema change in place. If the old application cannot work with the new schema, I’d plan a controlled roll-forward and get the service back to a consistent state. After recovery, I’d review the timeline and improve the pipeline, migration safety checks, and release validation.",
    "example": "If a nullable column was added and the new app failed, the old app may still work. If a column was dropped, rolling the old app back may make the outage worse.",
    "followups": [
      "What does backward-compatible migration mean?",
      "When would you restore from backup?",
      "What would you add to the release pipeline afterward?"
    ]
  },
  {
    "id": 6,
    "category": "CI/CD & security",
    "title": "How would you implement automated quality and security gates in a multi-stage CI/CD pipeline?",
    "simple": "Put fast checks early, security checks before release, and approvals around production changes.",
    "answer": "On pull requests, I’d run formatting, linting, unit tests, Terraform fmt and validate, and any policy checks that provide fast feedback. When building a container, I’d scan dependencies and the image for known vulnerabilities. For infrastructure changes, I’d run Terraform plan and make the diff available for review; tools such as Checkov or tfsec can flag risky configurations. Then I’d deploy to staging and run integration or smoke tests. Production should require approved, reviewed changes and successful earlier gates. After deployment, I’d check health signals and have a documented rollback or roll-forward procedure. The exact blocking thresholds should match the organization’s risk policy rather than treating every low-severity finding the same.",
    "example": "Block a new public S3 bucket or critical container vulnerability, but route lower-severity findings into a tracked remediation process when policy permits.",
    "followups": [
      "What checks would you run on every PR?",
      "How do you manage exceptions?",
      "Where should secrets scanning happen?"
    ]
  },
  {
    "id": 7,
    "category": "Terraform & automation",
    "title": "How do you structure reusable Terraform modules across multiple accounts and environments?",
    "simple": "Separate reusable resource definitions from environment-specific values, and keep state isolated.",
    "answer": "I use reusable child modules for common building blocks such as networking, EKS, IAM, or databases, and root configurations to compose them for a specific environment. Inputs let the same module work with different CIDRs, sizes, names, and account settings; outputs pass values such as subnet IDs between modules. I keep environment-specific values in separate configuration and isolate state so a development operation cannot accidentally operate on production state. For multiple AWS accounts, I use appropriately scoped roles and assume-role access rather than long-lived credentials. In CI, I run formatting, validation, plan, and review before an approved apply.",
    "example": "A networking module outputs private subnet IDs. The EKS root configuration passes those IDs to the cluster module instead of duplicating networking logic.",
    "followups": [
      "What belongs in a module versus a root module?",
      "Why is remote state locking important?",
      "How do you avoid accidentally applying to production?"
    ]
  },
  {
    "id": 8,
    "category": "AI & security",
    "title": "What architectural and security validations do you enforce before AI-generated code is merged?",
    "simple": "AI-written code must pass the same pipeline as human-written code, with careful review for security and architecture mistakes.",
    "answer": "I’d run the same automated checks as other code: formatting, validation, tests, a Terraform plan, infrastructure policy checks, and container scanning where relevant. During review I’d inspect IAM scope, network exposure, encryption, resource placement, naming conventions, provider versions, and whether secrets have been hardcoded. I pay particular attention to code that looks syntactically correct but grants more access than needed. For Kubernetes or Helm changes, I’d check RBAC, routing, resource requests and limits, and rollout behavior. The generated code remains my responsibility; it does not merge or reach production without the required human review and approval.",
    "example": "If an AI-generated policy uses Action: \"*\", check which exact actions are needed and scope them to the correct resources.",
    "followups": [
      "What is least privilege?",
      "How do you detect secrets in Git?",
      "What risks arise from untrusted repository instructions?"
    ]
  },
  {
    "id": 9,
    "category": "Monitoring & observability",
    "title": "What are the three pillars of observability, and what tools have you used?",
    "simple": "Metrics show patterns, logs record events, and traces show how one request travels through services.",
    "answer": "The three pillars are metrics, logs, and traces. Metrics are numbers over time, such as request rate, error rate, latency, CPU, and memory. Logs are timestamped events that help explain what happened. Traces follow a request across services and show where time was spent. At vAuto, I use Datadog for monitoring and troubleshooting; at Rally Health, CloudWatch was a key monitoring tool. They complement each other: a metric or alert tells me something is wrong, a trace can narrow down the slow component, and logs provide the detailed event context.",
    "example": "A latency alert fires in Datadog. I check the service dashboard, inspect a slow trace, then search logs around that trace’s timestamp and request ID.",
    "followups": [
      "What is the difference between monitoring and observability?",
      "What is p95 latency?",
      "How would you investigate a sudden increase in 5xx errors?"
    ]
  },
  {
    "id": 10,
    "category": "Monitoring & observability",
    "title": "What are the four golden signals, and what is saturation?",
    "simple": "Track latency, traffic, errors, and saturation to understand user experience and resource pressure.",
    "answer": "The four golden signals are latency, traffic, errors, and saturation. Latency measures how long a request takes. Traffic measures demand, such as requests per second. Errors measure failed or unsuccessful requests. Saturation tells us how close a constrained resource is to its limit, such as a full connection pool, a busy CPU, a growing queue, or low disk space. I would monitor trends and alert on user-impacting symptoms, not just wait for a resource to reach 100%. For latency, percentiles such as p95 often reveal slow experiences hidden by a good average.",
    "example": "A service has normal CPU but its database connection pool is 98% used and p95 latency is rising. Saturation can explain the slowdown before a complete failure.",
    "followups": [
      "Why can averages hide problems?",
      "What is an SLO?",
      "How do you avoid alert fatigue?"
    ]
  },
  {
    "id": 11,
    "category": "Monitoring & observability",
    "title": "How do you aggregate high-volume distributed logs without excessive ingestion cost?",
    "simple": "Collect useful logs, add context, filter noise safely, and use retention rules that match how the logs are needed.",
    "answer": "I’d standardize structured logs and attach fields such as service, environment, namespace, pod, and request ID. A node-level collector such as Fluent Bit can forward container logs to a central system. I’d set sensible production log levels, filter repetitive noise such as health checks where appropriate, and avoid logging secrets or unnecessary personal data. For events that only need counting, log-based metrics can be cheaper than retaining every line. Retention and archival should match incident-response and compliance needs, and any sampling or filtering must preserve enough information to investigate real incidents.",
    "example": "Keep application errors and security events searchable, but avoid ingesting every successful readiness probe as a full log record.",
    "followups": [
      "What is structured logging?",
      "How would you investigate a request across services?",
      "What should never be written to logs?"
    ]
  },
  {
    "id": 12,
    "category": "AI & operations",
    "title": "What is AIOps?",
    "simple": "AIOps applies machine learning or AI techniques to operations data to help detect, group, and investigate incidents.",
    "answer": "AIOps uses operational data such as metrics, logs, traces, alerts, and deployment events to assist detection and diagnosis. Examples include identifying unusual behavior against a baseline, grouping many related alerts into one incident, and suggesting likely causes based on recent changes. I see it as decision support, not a replacement for reliable instrumentation, runbooks, or engineering judgment. At vAuto, my AI-assisted incident-diagnostic workflow correlates Kubernetes pod state with deployment history and Terraform changes to suggest likely causes. I would validate its suggestions against actual evidence before taking action.",
    "example": "Several pods start failing shortly after a Helm release. A diagnostic workflow correlates the timing with the deployment and surfaces the changed probe or routing configuration for investigation.",
    "followups": [
      "How do you measure whether an AI diagnosis is useful?",
      "How do you prevent unsafe automated remediation?",
      "What is the difference between AIOps and a chatbot?"
    ]
  },
  {
    "id": 13,
    "category": "AWS networking & architecture",
    "title": "How would you design a secure, highly available AWS architecture with public, private, and database subnets?",
    "simple": "Spread the system across availability zones and keep each tier reachable only by the tier that needs it.",
    "answer": "I’d start with at least two Availability Zones and separate public, private application, and database subnets. The public subnets contain the internet-facing load balancer and required egress components. Application workloads such as EKS nodes run in private subnets. The database sits in isolated database subnets and is not directly reachable from the internet. Security groups should allow only required paths—for example, HTTPS to the load balancer, application traffic from the load balancer to the service, and database traffic only from the application tier. I’d use encryption at rest and in transit, managed secrets, multi-AZ database options where appropriate, and VPC endpoints for supported AWS services when they improve security or cost.",
    "example": "Internet → ALB on HTTPS → private application tier → database security group allowing only the application tier’s required database port.",
    "followups": [
      "What is the difference between a security group and a NACL?",
      "When do you need NAT gateways?",
      "How do you make the database highly available?"
    ]
  },
  {
    "id": 14,
    "category": "AWS networking & IAM",
    "title": "An S3 bucket is in Account A and an ECS application is in Account B. There is no public internet. How do you connect them securely?",
    "simple": "Configure permissions in both accounts and use a private network path to S3.",
    "answer": "I’d give the ECS task a task role in Account B with only the required S3 actions. The bucket policy in Account A must trust that role for the specific bucket and prefix. Both the identity policy and resource policy need to allow the access. To avoid public internet routing, I’d create an S3 Gateway VPC Endpoint in the ECS VPC and configure the private subnet route tables to use it. I could also restrict the bucket policy to the expected VPC endpoint. If the objects use a customer-managed KMS key, the key policy and IAM permissions must allow the required decrypt operation as well.",
    "example": "The task needs GetObject for `reports/` only. Scope permissions to that prefix instead of granting access to every object in the bucket.",
    "followups": [
      "Why do both IAM and bucket policies matter?",
      "What is a VPC endpoint?",
      "What additional permission is needed for SSE-KMS objects?"
    ]
  },
  {
    "id": 15,
    "category": "Kubernetes & releases",
    "title": "A rolling update drops active connections. How would you configure probes and lifecycle hooks to prevent this?",
    "simple": "Give traffic routing time to stop sending new requests, and give the application time to finish existing requests before it exits.",
    "answer": "I’d check the load balancer and endpoint removal timing, application shutdown behavior, and rollout settings. Readiness probes should remove a pod from service when it cannot safely accept traffic; liveness probes should detect a process that needs restarting, and the two should not be treated as interchangeable. A preStop hook can provide a short drain period when needed, while terminationGracePeriodSeconds must allow the hook and in-flight requests to finish. The application should handle SIGTERM gracefully. For a rolling update, maxUnavailable and maxSurge should preserve enough healthy capacity, and I’d verify the behavior with realistic traffic and the actual load-balancer integration.",
    "example": "If a pod needs 10 seconds to drain, a 5-second termination grace period is insufficient. Tune the drain and grace periods from observed request duration and routing propagation.",
    "followups": [
      "What does readiness do that liveness does not?",
      "What is a preStop hook?",
      "How would you test graceful shutdown?"
    ]
  },
  {
    "id": 16,
    "category": "Kubernetes fundamentals",
    "title": "Explain the relationship between Pods, Deployments, ReplicaSets, Services, and Ingress.",
    "simple": "These Kubernetes objects handle running containers, keeping the desired number alive, providing stable access, and routing incoming HTTP traffic.",
    "answer": "A Pod runs one or more containers. A ReplicaSet maintains the desired number of matching pods. A Deployment manages ReplicaSets and coordinates updates and rollbacks. A Service gives a stable network endpoint for a changing set of pods, usually selected by labels. Ingress defines HTTP or HTTPS routing rules into the cluster; an Ingress Controller implements those rules and may provision or configure a load balancer. The exact request path depends on the cluster’s networking setup, but it commonly goes from DNS and a load balancer through the routing layer to a Service and then a healthy Pod.",
    "example": "A Deployment runs three API pods. A Service selects them by labels. An ingress or Gateway routes `api.example.com` traffic to that Service.",
    "followups": [
      "Why not create Pods directly?",
      "What happens during a Deployment rollout?",
      "How is Gateway API different from Ingress?"
    ]
  },
  {
    "id": 17,
    "category": "Scripting & automation",
    "title": "Do you have scripting experience? When would you use Python versus Bash?",
    "simple": "Use Bash to glue command-line tools together; use Python when the automation needs more logic, data handling, or testability.",
    "answer": "I use Bash for straightforward command sequences, wrappers around kubectl or the AWS CLI, and small operational tasks. I choose Python when I need structured error handling, API calls, retries, JSON or YAML parsing, reusable functions, or unit tests. In AWS automation, Python with boto3 is useful for interacting with AWS resources in a controlled and repeatable way. Whatever the language, I include logging, clear exit codes, safe handling of credentials, and a dry-run option when a script can change infrastructure.",
    "example": "A short script that runs a few kubectl commands may fit Bash. A tool that queries AWS, parses responses, retries throttled API calls, and emits a report is usually better in Python.",
    "followups": [
      "How do you handle errors and retries?",
      "How do you avoid exposing secrets in logs?",
      "How would you test an infrastructure script?"
    ]
  },
  {
    "id": 18,
    "category": "Security & secrets",
    "title": "How do you manage and rotate credentials, certificates, or passwords in a cloud-native environment?",
    "simple": "Keep secrets out of source code, give workloads temporary scoped access, and automate rotation where possible.",
    "answer": "I keep credentials out of Git, container images, and plain-text configuration. In AWS, Secrets Manager is appropriate for sensitive values that need controlled access and rotation; Parameter Store can hold configuration and some secret values depending on requirements. EKS workloads should use an identity mechanism such as IRSA or EKS Pod Identity to obtain scoped AWS permissions rather than storing long-lived access keys. I’d restrict secret access by role, audit access, scan repositories for accidental secrets, and plan rotation so applications can safely pick up updated values. For TLS, use a managed certificate service such as ACM for supported load-balancer endpoints and an in-cluster certificate workflow where appropriate.",
    "example": "A Helm chart contains a reference to a secret, not the actual database password. The workload identity can read only the secret it needs.",
    "followups": [
      "What is least privilege?",
      "How does IRSA work?",
      "What happens if a credential is leaked?"
    ]
  },
  {
    "id": 19,
    "category": "Terraform & automation",
    "title": "What is Terraform state, and why does it need locking?",
    "simple": "State is Terraform’s record of which real resources correspond to your configuration. Locking prevents two operations from changing the same state at the same time.",
    "answer": "Terraform state maps configuration resources to real infrastructure objects and stores metadata Terraform needs to plan changes. In a team, I’d use a remote backend with appropriate access controls, encryption, versioning or recovery, and a locking mechanism supported by the chosen backend. Locking prevents concurrent operations from racing and corrupting or conflicting with the state. I never edit state by hand unless following a carefully reviewed recovery procedure, and I protect production state separately from lower environments.",
    "example": "Two engineers start applies at once. State locking makes one wait or fail safely instead of letting both update the same state concurrently.",
    "followups": [
      "What would you do if state was lost?",
      "What is terraform plan versus apply?",
      "Why separate production state?"
    ]
  },
  {
    "id": 20,
    "category": "AWS & Kubernetes",
    "title": "How do you decide how many EKS worker nodes are needed?",
    "simple": "Estimate workload requests, account for overhead and availability, then validate with observed usage and scaling behavior.",
    "answer": "I start with pod CPU and memory requests, the number of replicas, DaemonSet overhead, and the capacity of the chosen instance types. I reserve room for system components and failure scenarios rather than targeting 100% utilization. I also consider availability-zone spread, disruption budgets, and whether workloads can fit on the remaining nodes if one node is lost. Cluster Autoscaler or Karpenter can adjust capacity, while HPA or other workload scaling changes replica counts. Finally, I validate the design using metrics and load tests because requests and real usage are not always the same.",
    "example": "If each replica requests 500 millicores and 1 GiB and the service needs six replicas, calculate baseline requests, add system overhead and headroom, then check packing across nodes and AZs.",
    "followups": [
      "What is the difference between HPA and Cluster Autoscaler?",
      "Why do requests and limits matter?",
      "What causes a pod to stay Pending?"
    ]
  },
  {
    "id": 21,
    "category": "Kubernetes & releases",
    "title": "What is the difference between a readiness probe and a liveness probe?",
    "simple": "Readiness decides whether a pod should receive traffic. Liveness decides whether Kubernetes should restart a container.",
    "answer": "A readiness probe indicates whether the application is ready to serve requests. If it fails, Kubernetes removes the pod from ready service endpoints but does not automatically restart the container. A liveness probe detects a container that is stuck or unhealthy enough to restart. Startup probes are useful for applications that need longer initialization. Poorly designed liveness checks can cause restart loops during a slow dependency or startup, so I tune probe paths, delays, timeouts, and thresholds to match actual application behavior.",
    "example": "A service is still starting up: startup/readiness can keep it out of traffic. If the process later deadlocks, liveness can trigger a restart.",
    "followups": [
      "What is a startup probe?",
      "Should liveness depend on a remote database?",
      "How do probes affect rolling updates?"
    ]
  },
  {
    "id": 22,
    "category": "CI/CD & security",
    "title": "How would you secure GitHub Actions deployments to AWS?",
    "simple": "Use short-lived federated credentials, least privilege, protected deployment environments, and reviewed workflows.",
    "answer": "I’d prefer GitHub Actions OIDC federation to assume a narrowly scoped AWS role, rather than storing long-lived AWS access keys as repository secrets. The trust policy should restrict the repository, branch or protected environment, and audience as appropriate. The role should have only the permissions needed for that workflow. I’d pin or review third-party actions, protect branches, require reviews, separate plan from apply where useful, and require environment approval for production. I’d also avoid printing secrets and retain enough audit logs to trace who triggered a deployment and what changed.",
    "example": "A staging workflow assumes a staging role, while the production role trusts only the protected production environment and has a separate approval gate.",
    "followups": [
      "What is OIDC?",
      "How do you scope the role trust policy?",
      "Why are long-lived access keys risky?"
    ]
  },
  {
    "id": 23,
    "category": "Monitoring & observability",
    "title": "What is the difference between an SLI, SLO, and SLA?",
    "simple": "An SLI is what you measure, an SLO is your internal target, and an SLA is a commitment that may have consequences if missed.",
    "answer": "An SLI is a measured indicator of service behavior, such as the percentage of successful requests or p95 latency. An SLO is the target for that indicator over a defined window, such as 99.9% successful requests over 30 days. An SLA is an agreement with customers that may define remedies or penalties when commitments are missed. I’d choose indicators that reflect the user experience, measure them consistently, and use error budgets to guide release risk and reliability work.",
    "example": "SLI: successful requests divided by total eligible requests. SLO: 99.9% success over 30 days. SLA: the customer contract that states what happens if the agreed service level is missed.",
    "followups": [
      "What is an error budget?",
      "Why not alert on every SLO breach?",
      "How do you choose a latency objective?"
    ]
  },
  {
    "id": 24,
    "category": "AWS networking & architecture",
    "title": "What is the difference between a public and private subnet?",
    "simple": "The difference is primarily the subnet’s route table and whether it has a route to an internet gateway—not simply whether a resource has a public IP.",
    "answer": "A public subnet’s route table has a route to an Internet Gateway, allowing resources with suitable public addressing and security rules to communicate with the internet. A private subnet has no direct route to the Internet Gateway. It may use a NAT Gateway for outbound IPv4 access, or VPC endpoints to reach supported AWS services privately. Private does not mean automatically secure; security groups, network ACLs, IAM, and application configuration still matter.",
    "example": "An ALB may live in public subnets, while EKS worker nodes and databases are in private subnets with narrowly scoped network access.",
    "followups": [
      "What does a NAT Gateway do?",
      "What is an Internet Gateway?",
      "When would you use a VPC endpoint?"
    ]
  },
  {
    "id": 25,
    "category": "Terraform & automation",
    "title": "What is Terraform drift, and how do you handle it?",
    "simple": "Drift means real infrastructure no longer matches the configuration Terraform expects.",
    "answer": "I detect drift by running plans regularly or before a change and reviewing differences between configuration, state, and real infrastructure. First I determine whether the manual change was intentional and whether it was an emergency fix. If the change is correct, I update the code so Terraform becomes the source of truth. If it is not intended, I plan a controlled reconciliation. I avoid blindly applying a plan until I understand destructive or security-sensitive changes, and I use permissions and workflows to reduce untracked manual changes.",
    "example": "Someone manually opens an inbound security-group rule. The next plan shows the difference; confirm the intended access, then either codify the approved rule or remove it safely.",
    "followups": [
      "How can you detect drift automatically?",
      "What is terraform refresh behavior?",
      "How do you handle emergency manual changes?"
    ]
  },
  {
    "id": 26,
    "category": "Kubernetes fundamentals",
    "title": "What is the difference between a Deployment and a StatefulSet?",
    "simple": "A Deployment is for mostly interchangeable replicas; a StatefulSet is for workloads that need stable identity or storage association.",
    "answer": "A Deployment manages replicas that can generally be replaced by any equivalent pod. It is common for stateless APIs and web services. A StatefulSet gives pods stable ordinal identities and can associate persistent volumes with those identities, which is useful for certain stateful systems. StatefulSets do not magically make an application highly available; the application still needs correct replication, backup, and recovery design. I’d normally use a managed database when it better meets operational needs instead of running a database in Kubernetes by default.",
    "example": "A stateless API usually fits a Deployment. A clustered system that depends on stable member identities may fit a StatefulSet if its operational requirements are understood.",
    "followups": [
      "What does a PersistentVolumeClaim do?",
      "Why are databases harder to operate in Kubernetes?",
      "How does a StatefulSet update work?"
    ]
  },
  {
    "id": 27,
    "category": "Incidents & reliability",
    "title": "A production service is returning 5xx errors. How do you investigate?",
    "simple": "Confirm impact, narrow the time window, correlate symptoms with recent changes, and use evidence before changing anything.",
    "answer": "I’d first assess customer impact and severity, check alerts and dashboards, and communicate with the incident channel. Then I’d compare error rate, latency, traffic, pod restarts, resource saturation, and dependency health. I’d correlate the start time with deployments, configuration changes, infrastructure plans, and traffic changes. Logs and traces help identify the failing path. If a recent release is the likely cause and rollback is safe, I’d follow the rollback procedure; otherwise I’d mitigate the immediate impact and continue diagnosis. After recovery, I’d document the timeline and add a prevention action with an owner.",
    "example": "A 5xx increase begins immediately after a Helm release. Compare the release diff, readiness events, and application logs before deciding whether to roll back.",
    "followups": [
      "What if dashboards show no obvious cause?",
      "How do you communicate during an incident?",
      "What belongs in a blameless postmortem?"
    ]
  },
  {
    "id": 28,
    "category": "AWS & Kubernetes",
    "title": "What is IAM least privilege, and how do you apply it to Kubernetes workloads?",
    "simple": "Give each person or workload only the actions and resources it actually needs, and remove permissions it does not need.",
    "answer": "I define the specific AWS actions and resources required by a workload, then scope the IAM policy to those actions and resources. For EKS, I use a workload identity approach such as IRSA or EKS Pod Identity instead of placing AWS keys in manifests. Kubernetes RBAC is a separate layer that controls Kubernetes API access; AWS IAM permissions and Kubernetes RBAC should not be confused. I review trust policies, namespace and service-account boundaries, and audit access where practical. Permissions should be tested and refined as the workload changes.",
    "example": "A reporting pod needs to read objects from one S3 prefix. Give its role only the required list/read actions for that prefix, not administrator access.",
    "followups": [
      "What is the difference between IAM and Kubernetes RBAC?",
      "How does IRSA connect a service account to an AWS role?",
      "Why are wildcard permissions dangerous?"
    ]
  },
  {
    "id": 29,
    "category": "CI/CD & releases",
    "title": "What is GitOps, and how is it different from a push-based deployment pipeline?",
    "simple": "GitOps treats Git as the desired-state source and uses a controller to reconcile the live environment toward that state.",
    "answer": "In a push-based pipeline, a CI job commonly builds and then pushes deployment changes to the cluster. With GitOps, desired Kubernetes configuration is stored in Git and a controller such as Argo CD continuously compares that desired state with the live cluster and reconciles differences according to policy. Benefits include a clear audit trail and easier visibility into drift. Trade-offs include controller operations, repository and secret design, and deciding how emergency changes are handled. GitOps does not remove the need for CI tests, approvals, or secure access.",
    "example": "A PR updates a Helm values file. After review and merge, Argo CD detects the new desired state and syncs it to the target cluster.",
    "followups": [
      "How does Argo CD detect drift?",
      "Where should secrets live?",
      "How do you handle an emergency hotfix?"
    ]
  },
  {
    "id": 30,
    "category": "Career & behavioral",
    "title": "Tell me about a weakness or an area you are actively improving.",
    "simple": "Choose a real but manageable weakness, explain how you noticed it, and describe specific steps you take to improve.",
    "answer": "One area I’ve been improving is knowing when to stop investigating a technical problem and bring in another perspective. In platform work, it is easy to go deep into a Terraform or Kubernetes issue before confirming the highest-impact next step. I now time-box the first investigation, write down the evidence and options, and ask a teammate for a quick review when the risk or uncertainty is high. That helps me keep ownership while avoiding unnecessary delays. I also make sure the improvement is visible in how I prioritize production impact and communicate trade-offs.",
    "example": "For an unfamiliar issue, spend the first 30–45 minutes gathering facts and checking runbooks, then share a concise hypothesis and ask for a second opinion if the cause is still unclear.",
    "followups": [
      "How has this changed your work?",
      "Can you give a real example?",
      "What feedback have you received recently?"
    ]
  }
];
