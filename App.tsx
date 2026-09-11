import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight, BarChart3, BriefcaseBusiness, Check, ChevronRight, Circle,
  Compass, Crosshair, Filter, Flame, LayoutDashboard, Lightbulb, ListChecks, LockKeyhole, Map, Menu, Monitor, Palette, RotateCcw,
  Search, Sparkles, Target, TrendingUp, X, Zap,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

type Profile = {
  qualification: string;
  branch: string;
  year: string;
  interests: string;
  goal: string;
};
type Skill = {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Later';
  level: string;
  description: string;
  icon: ReactNode;
  topics: string[];
  reason: string;
};
type RoadmapItem = { id: string; week: string; title: string; detail: string; kind: string };
type ProjectIdea = { title: string; detail: string; tag: string; difficulty: string; skills: string; after: string };
type CareerConfig = {
  skillIds: string[];
  roles: string[];
  technologies: string[];
  focus: string;
  interview: string[];
  projects: ProjectIdea[];
};

const QUALIFICATIONS = ['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'MCA', 'M.Tech', 'MBA', 'Diploma', 'Other'];
const BRANCHES = [
  'Computer Science / CSE', 'Information Technology / IT', 'Artificial Intelligence & Machine Learning',
  'Data Science', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other',
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];
const INTEREST_OPTIONS = [
  'Programming', 'Web Development', 'Artificial Intelligence', 'Machine Learning', 'Data',
  'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX', 'Embedded Systems',
  'Software Development', 'Problem Solving', 'Business / Management',
];
const CAREER_OPTIONS = [
  'AI / ML Engineer', 'Data Analyst', 'Data Scientist', 'Full Stack Developer',
  'Frontend Developer', 'Backend Developer', 'Software Developer', 'Cybersecurity Analyst',
  'Cloud Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Embedded Systems Engineer',
];

const defaultProfile: Profile = {
  qualification: '',
  branch: '',
  year: '',
  interests: '',
  goal: '',
};

const skillCatalog: Skill[] = [
  { id: 'python', title: 'Python', category: 'Foundation', priority: 'High', level: 'Beginner', description: 'Build a reliable programming base with readable code, data structures, and problem-solving patterns.', icon: <Zap size={18} />, topics: ['Variables and data types', 'Conditions and loops', 'Functions and collections', 'OOP basics', 'Problem solving'], reason: 'Python is a flexible base for automation, data, AI, and backend paths.' },
  { id: 'dsa', title: 'Data structures & algorithms', category: 'Foundation', priority: 'High', level: 'Intermediate', description: 'Learn to choose the right structure, reason about complexity, and solve unfamiliar problems with confidence.', icon: <ListChecks size={18} />, topics: ['Arrays and strings', 'Stacks and queues', 'Trees and graphs', 'Sorting and searching', 'Big-O complexity'], reason: 'Strong problem solving appears in technical interviews and day-to-day engineering decisions.' },
  { id: 'sql', title: 'SQL & data thinking', category: 'Core', priority: 'High', level: 'Intermediate', description: 'Ask better questions of data with joins, aggregations, and a healthy skepticism of dashboards.', icon: <BarChart3 size={18} />, topics: ['SELECT, WHERE and ORDER BY', 'GROUP BY and HAVING', 'Joins and subqueries', 'CTEs and window functions', 'Database design'], reason: 'SQL turns curiosity into evidence you can act on across data and product roles.' },
  { id: 'statistics', title: 'Statistics', category: 'Core', priority: 'High', level: 'Intermediate', description: 'Understand variation, uncertainty, and experiments well enough to make decisions from imperfect data.', icon: <TrendingUp size={18} />, topics: ['Probability basics', 'Distributions', 'Hypothesis testing', 'Correlation and regression', 'A/B testing'], reason: 'Statistical thinking protects your conclusions from noisy or misleading data.' },
  { id: 'machine-learning', title: 'Machine learning', category: 'Core', priority: 'High', level: 'Intermediate', description: 'Move from prepared data to evaluated models with a disciplined, repeatable workflow.', icon: <Lightbulb size={18} />, topics: ['Supervised learning', 'Regression and classification', 'Feature engineering', 'Model evaluation', 'Overfitting and tuning'], reason: 'This is the core craft behind useful predictive systems.' },
  { id: 'frontend', title: 'Frontend foundations', category: 'Core', priority: 'High', level: 'Intermediate', description: 'Use HTML, CSS, and React to turn ideas into accessible interfaces people can actually use.', icon: <Monitor size={18} />, topics: ['Semantic HTML and CSS', 'Components and props', 'State and hooks', 'Forms and routing', 'API integration'], reason: 'A fast route from idea to a portfolio-worthy proof of your craft.' },
  { id: 'backend', title: 'Backend & APIs', category: 'Core', priority: 'High', level: 'Intermediate', description: 'Design dependable services that move data between clients, APIs, and databases.', icon: <LayoutDashboard size={18} />, topics: ['HTTP and REST', 'API contracts', 'Authentication basics', 'Databases and caching', 'Error handling'], reason: 'Backend fluency makes full products feel reliable, not just demo-ready.' },
  { id: 'git', title: 'Git & collaboration', category: 'Career edge', priority: 'High', level: 'Beginner', description: 'Make your work easy to review, recover, and build on with a clear collaboration habit.', icon: <Compass size={18} />, topics: ['Commits and branches', 'Pull requests', 'Conflict resolution', 'README writing', 'GitHub portfolio'], reason: 'Teams need evidence that you can work in a shared codebase.' },
  { id: 'cloud', title: 'Cloud fundamentals', category: 'Advanced', priority: 'Medium', level: 'Intermediate', description: 'Understand the services, deployment choices, and reliability basics behind modern applications.', icon: <Target size={18} />, topics: ['Linux and networking', 'Cloud services', 'Containers', 'Monitoring', 'Security basics'], reason: 'Cloud literacy helps you ship software beyond your local machine.' },
  { id: 'cybersecurity', title: 'Cybersecurity foundations', category: 'Core', priority: 'High', level: 'Intermediate', description: 'Identify threats, protect systems, and build safer habits into every layer of a product.', icon: <LockKeyhole size={18} />, topics: ['Threat modeling', 'Network security', 'Identity and access', 'Secure coding', 'Security monitoring'], reason: 'Security analysts need both structured investigation and practical system awareness.' },
  { id: 'uiux', title: 'UI/UX design', category: 'Core', priority: 'High', level: 'Beginner', description: 'Turn user needs into clear flows, prototypes, and interfaces that are easy to understand.', icon: <Palette size={18} />, topics: ['User research', 'Information architecture', 'Wireframing', 'Prototyping', 'Usability testing'], reason: 'Good design reduces friction and gives your portfolio a point of view.' },
  { id: 'communication', title: 'Technical communication', category: 'Career edge', priority: 'Medium', level: 'Beginner', description: 'Make your work easy to understand through concise docs, demos, and decisions.', icon: <BriefcaseBusiness size={18} />, topics: ['Written clarity', 'Demo stories', 'Feedback loops', 'Resume storytelling', 'Behavioral interviews'], reason: 'Good work travels further when other people can follow it.' },
];

const careerConfig: Record<string, CareerConfig> = {
  'AI / ML Engineer': {
    skillIds: ['python', 'statistics', 'sql', 'machine-learning', 'git', 'cloud', 'communication'],
    roles: ['ML Engineer', 'AI Engineer', 'ML Developer', 'Data Scientist'],
    technologies: ['Python', 'NumPy', 'Pandas', 'SQL', 'Scikit-learn', 'TensorFlow / PyTorch', 'Git'],
    focus: 'turning data into reliable models and useful products',
    interview: ['Python and DSA', 'Statistics and ML theory', 'Model trade-offs', 'Projects and deployment'],
    projects: [
      { title: 'Student performance predictor', detail: 'Use study patterns to predict outcomes, explain the features, and document the limits of your model.', tag: 'Machine learning', difficulty: 'Intermediate', skills: 'Python · Pandas · Scikit-learn', after: 'Python + statistics' },
      { title: 'Customer churn lab', detail: 'Build a classification workflow and make the retention recommendations understandable to a non-technical team.', tag: 'Applied AI', difficulty: 'Intermediate', skills: 'SQL · ML · Visualization', after: 'SQL + machine learning' },
      { title: 'Image classification API', detail: 'Train a small image model and wrap it in a simple API that someone else can try.', tag: 'Deep learning', difficulty: 'Advanced', skills: 'Python · PyTorch · APIs', after: 'ML fundamentals + Git' },
    ],
  },
  'Data Analyst': {
    skillIds: ['sql', 'statistics', 'python', 'git', 'communication', 'uiux'],
    roles: ['Data Analyst', 'Business Analyst', 'Product Analyst', 'BI Analyst'],
    technologies: ['SQL', 'Excel', 'Python', 'Pandas', 'Power BI / Tableau', 'Git'],
    focus: 'turning messy questions into clear decisions backed by evidence',
    interview: ['SQL joins and windows', 'Statistics', 'Case studies', 'Communication and business context'],
    projects: [
      { title: 'Sales dashboard', detail: 'Answer one sales question with a clean data model, a dashboard, and a short recommendation memo.', tag: 'Analytics', difficulty: 'Beginner', skills: 'SQL · Visualization · Storytelling', after: 'SQL basics' },
      { title: 'E-commerce behavior analysis', detail: 'Find where customers drop off, test a hypothesis, and explain what the team should investigate next.', tag: 'Product analytics', difficulty: 'Intermediate', skills: 'SQL · Python · Statistics', after: 'SQL + statistics' },
      { title: 'Financial health report', detail: 'Create a repeatable monthly report with a clear executive summary and honest caveats.', tag: 'Business insight', difficulty: 'Intermediate', skills: 'SQL · Spreadsheets · Communication', after: 'Data cleaning + charts' },
    ],
  },
  'Data Scientist': {
    skillIds: ['python', 'statistics', 'sql', 'machine-learning', 'git', 'communication', 'cloud'],
    roles: ['Data Scientist', 'Research Scientist', 'Decision Scientist', 'ML Analyst'],
    technologies: ['Python', 'Pandas', 'SQL', 'Scikit-learn', 'Jupyter', 'Git'],
    focus: 'combining statistical reasoning, experimentation, and modeling',
    interview: ['Statistics', 'ML fundamentals', 'Python and SQL', 'Product sense and experiments'],
    projects: [
      { title: 'Recommendation system', detail: 'Build a baseline recommender, measure it honestly, and compare quality with a simple non-ML approach.', tag: 'Modeling', difficulty: 'Advanced', skills: 'Python · ML · Evaluation', after: 'ML + statistics' },
      { title: 'Customer behavior study', detail: 'Segment users, describe meaningful patterns, and propose a next experiment for the product team.', tag: 'Research', difficulty: 'Intermediate', skills: 'SQL · Statistics · Visualization', after: 'SQL + experimentation' },
      { title: 'House price prediction', detail: 'Compare a few models and explain why the best metric is not always the most useful decision.', tag: 'Foundations', difficulty: 'Beginner', skills: 'Python · Pandas · Regression', after: 'Python + statistics' },
    ],
  },
  'Full Stack Developer': {
    skillIds: ['frontend', 'backend', 'sql', 'git', 'dsa', 'cloud', 'communication'],
    roles: ['Full Stack Developer', 'Product Engineer', 'Web Developer', 'Software Engineer'],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs', 'Git'],
    focus: 'building complete product flows from interface to data',
    interview: ['JavaScript and React', 'APIs and databases', 'DSA', 'Projects and trade-offs'],
    projects: [
      { title: 'Student management system', detail: 'Build role-based workflows for students and staff with search, validation, and a usable empty state.', tag: 'Full stack', difficulty: 'Intermediate', skills: 'React · APIs · SQL', after: 'Frontend + backend' },
      { title: 'Job portal', detail: 'Create a focused job discovery flow with saved roles, filters, and a clear application state.', tag: 'Product build', difficulty: 'Advanced', skills: 'React · Node · PostgreSQL', after: 'APIs + database design' },
      { title: 'Online learning platform', detail: 'Ship one course flow with progress, content states, and a small creator dashboard.', tag: 'Portfolio build', difficulty: 'Advanced', skills: 'React · Auth · APIs', after: 'Core web foundations' },
    ],
  },
  'Frontend Developer': {
    skillIds: ['frontend', 'uiux', 'git', 'backend', 'dsa', 'communication'],
    roles: ['Frontend Developer', 'UI Engineer', 'Web Developer', 'Design Engineer'],
    technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git'],
    focus: 'making complex product ideas feel clear, fast, and human',
    interview: ['JavaScript and React', 'Accessibility', 'CSS and browser basics', 'UI implementation'],
    projects: [
      { title: 'College app redesign', detail: 'Improve one high-friction student flow and show the before, decisions, and accessible implementation.', tag: 'Interface craft', difficulty: 'Intermediate', skills: 'Research · React · Accessibility', after: 'UI/UX + React' },
      { title: 'Data-rich dashboard', detail: 'Turn a complex dataset into a responsive interface with loading, empty, error, and success states.', tag: 'Frontend systems', difficulty: 'Advanced', skills: 'React · Charts · APIs', after: 'Components + API integration' },
      { title: 'Accessible component kit', detail: 'Build and document a small set of reusable components that behave well with keyboard and screen readers.', tag: 'Design engineering', difficulty: 'Intermediate', skills: 'CSS · React · Accessibility', after: 'Frontend foundations' },
    ],
  },
  'Backend Developer': {
    skillIds: ['backend', 'sql', 'python', 'dsa', 'git', 'cloud', 'communication'],
    roles: ['Backend Developer', 'API Engineer', 'Software Engineer', 'Platform Engineer'],
    technologies: ['Node.js', 'Python', 'PostgreSQL', 'REST', 'Docker', 'Git'],
    focus: 'designing services that stay correct and understandable under change',
    interview: ['API design', 'Databases and SQL', 'DSA', 'Reliability and testing'],
    projects: [
      { title: 'Secure authentication service', detail: 'Implement a small account flow with validation, safe errors, and clear session boundaries.', tag: 'Backend', difficulty: 'Advanced', skills: 'APIs · SQL · Security', after: 'HTTP + database basics' },
      { title: 'Event booking API', detail: 'Model availability, prevent double booking, and make the API contract easy for a frontend to consume.', tag: 'Systems thinking', difficulty: 'Intermediate', skills: 'Node · SQL · REST', after: 'Backend + databases' },
      { title: 'Task queue worker', detail: 'Process background jobs with retries, observability, and a small admin view for failed work.', tag: 'Reliability', difficulty: 'Advanced', skills: 'Python · Queues · Cloud', after: 'APIs + cloud basics' },
    ],
  },
  'Software Developer': {
    skillIds: ['python', 'dsa', 'backend', 'sql', 'git', 'communication'],
    roles: ['Software Developer', 'Software Engineer', 'Application Developer', 'Systems Developer'],
    technologies: ['Python', 'JavaScript / TypeScript', 'SQL', 'Git', 'Testing', 'APIs'],
    focus: 'solving real problems with maintainable software',
    interview: ['DSA', 'Programming fundamentals', 'System design basics', 'Behavioral stories'],
    projects: [
      { title: 'Useful internal tool', detail: 'Interview one user, automate a repetitive task, and measure whether your tool actually saves time.', tag: 'Software craft', difficulty: 'Intermediate', skills: 'Python · APIs · Testing', after: 'Programming + Git' },
      { title: 'Study planner', detail: 'Build a planner that turns a goal into manageable sessions with persistence and thoughtful empty states.', tag: 'Product build', difficulty: 'Beginner', skills: 'Frontend · SQL · UX', after: 'Web foundations' },
      { title: 'Open-source contribution', detail: 'Choose a small issue, make a focused change, and write the explanation a maintainer needs to review it.', tag: 'Collaboration', difficulty: 'Intermediate', skills: 'Git · Communication · Testing', after: 'Git + problem solving' },
    ],
  },
  'Cybersecurity Analyst': {
    skillIds: ['cybersecurity', 'python', 'sql', 'cloud', 'git', 'communication', 'dsa'],
    roles: ['Security Analyst', 'SOC Analyst', 'Threat Analyst', 'Security Engineer'],
    technologies: ['Linux', 'Python', 'SIEM tools', 'Networking', 'Cloud IAM', 'Git'],
    focus: 'spotting risk early and responding with calm, structured investigation',
    interview: ['Networking', 'Threat modeling', 'Linux and scripting', 'Incident response'],
    projects: [
      { title: 'Security log analyzer', detail: 'Parse sample logs, surface suspicious patterns, and document what a responder should do next.', tag: 'Detection', difficulty: 'Intermediate', skills: 'Python · Logs · SQL', after: 'Python + security basics' },
      { title: 'Network monitoring dashboard', detail: 'Visualize traffic signals and create a clear escalation path for unusual activity.', tag: 'Monitoring', difficulty: 'Advanced', skills: 'Networking · APIs · UI', after: 'Networking + dashboards' },
      { title: 'Secure authentication review', detail: 'Threat-model an account flow, identify weaknesses, and propose fixes with evidence.', tag: 'App security', difficulty: 'Intermediate', skills: 'Security · APIs · Communication', after: 'Threat modeling' },
    ],
  },
  'Cloud Engineer': {
    skillIds: ['cloud', 'backend', 'git', 'dsa', 'cybersecurity', 'communication'],
    roles: ['Cloud Engineer', 'Cloud Developer', 'Site Reliability Engineer', 'Platform Engineer'],
    technologies: ['Linux', 'AWS / Azure', 'Docker', 'Kubernetes', 'Terraform', 'Git'],
    focus: 'making applications reliable, observable, and ready to scale',
    interview: ['Linux and networking', 'Cloud architecture', 'Containers', 'Reliability'],
    projects: [
      { title: 'Cloud website deployment', detail: 'Deploy a small web app with a clear architecture diagram, logs, and a rollback plan.', tag: 'Cloud', difficulty: 'Beginner', skills: 'Linux · Git · Cloud', after: 'Git + networking' },
      { title: 'Dockerized web application', detail: 'Package a full stack app with environment separation and a repeatable local workflow.', tag: 'Containers', difficulty: 'Intermediate', skills: 'Docker · APIs · SQL', after: 'Backend + Git' },
      { title: 'Service health dashboard', detail: 'Track latency and failures for a small service, then write the runbook someone else could follow.', tag: 'Reliability', difficulty: 'Advanced', skills: 'Cloud · APIs · Monitoring', after: 'Cloud fundamentals' },
    ],
  },
  'DevOps Engineer': {
    skillIds: ['cloud', 'git', 'backend', 'cybersecurity', 'dsa', 'communication'],
    roles: ['DevOps Engineer', 'Platform Engineer', 'Release Engineer', 'SRE'],
    technologies: ['Linux', 'Docker', 'CI/CD', 'Kubernetes', 'Cloud', 'Terraform'],
    focus: 'helping teams ship often without losing confidence in production',
    interview: ['CI/CD design', 'Linux and networking', 'Containers', 'Monitoring and incidents'],
    projects: [
      { title: 'CI/CD pipeline', detail: 'Automate checks, builds, and deployment for a small app with a clear failure path.', tag: 'Delivery', difficulty: 'Intermediate', skills: 'Git · CI/CD · Cloud', after: 'Git + Linux' },
      { title: 'Dockerized web app', detail: 'Create a reproducible multi-service development setup and document the decisions behind it.', tag: 'Infrastructure', difficulty: 'Beginner', skills: 'Docker · APIs · SQL', after: 'Backend basics' },
      { title: 'Incident response runbook', detail: 'Simulate a production issue, capture the signal, and write the steps that reduce recovery time.', tag: 'Operations', difficulty: 'Advanced', skills: 'Monitoring · Security · Communication', after: 'Cloud + monitoring' },
    ],
  },
  'UI/UX Designer': {
    skillIds: ['uiux', 'frontend', 'communication', 'sql', 'git', 'product'],
    roles: ['Product Designer', 'UX Designer', 'UI Designer', 'Design Researcher'],
    technologies: ['Figma', 'Prototyping', 'HTML / CSS', 'Design systems', 'Analytics', 'Git'],
    focus: 'finding the real problem and making the next action obvious',
    interview: ['Portfolio walkthrough', 'Research methods', 'Interaction decisions', 'Critique and collaboration'],
    projects: [
      { title: 'College app redesign', detail: 'Choose one student journey, interview two people, and make the improvement measurable.', tag: 'Research', difficulty: 'Beginner', skills: 'Research · Figma · UX', after: 'UX foundations' },
      { title: 'E-commerce UX case study', detail: 'Improve one conversion moment and show the reasoning from evidence to prototype to test.', tag: 'Case study', difficulty: 'Intermediate', skills: 'UX · UI · Testing', after: 'Research + prototyping' },
      { title: 'Mobile app prototype', detail: 'Design a focused mobile flow with accessible states and a short handoff for engineering.', tag: 'Product design', difficulty: 'Intermediate', skills: 'Figma · UI · Communication', after: 'UI/UX + design systems' },
    ],
  },
  'Embedded Systems Engineer': {
    skillIds: ['python', 'dsa', 'cloud', 'cybersecurity', 'git', 'communication'],
    roles: ['Embedded Systems Engineer', 'Firmware Engineer', 'IoT Developer', 'Systems Engineer'],
    technologies: ['C / C++', 'Microcontrollers', 'RTOS', 'Embedded Linux', 'Protocols', 'Git'],
    focus: 'connecting software, hardware, and timing constraints into dependable systems',
    interview: ['C and memory', 'Embedded protocols', 'Operating systems', 'Debugging'],
    projects: [
      { title: 'Sensor monitoring system', detail: 'Read a sensor, handle edge cases, and visualize the result with a tiny companion app.', tag: 'Embedded', difficulty: 'Intermediate', skills: 'C · Microcontrollers · APIs', after: 'Programming + electronics' },
      { title: 'Home automation prototype', detail: 'Connect two devices, document the protocol, and design for safe failure when the network drops.', tag: 'IoT', difficulty: 'Advanced', skills: 'Embedded · Networking · Security', after: 'Protocols + Git' },
      { title: 'Real-time task scheduler', detail: 'Model task priorities and timing constraints, then explain your trade-offs with a test plan.', tag: 'Systems', difficulty: 'Advanced', skills: 'C · RTOS · DSA', after: 'DSA + operating systems' },
    ],
  },
};

const fallbackCareer: CareerConfig = careerConfig['Software Developer'];

function getCareerConfig(goal: string): CareerConfig {
  return careerConfig[goal] ?? fallbackCareer;
}

function getSkillsForGoal(goal: string, interests: string): Skill[] {
  const config = getCareerConfig(goal);
  const interestText = interests.toLowerCase();
  return config.skillIds.map((id, index) => {
    const skill = skillCatalog.find(item => item.id === id) ?? skillCatalog[0];
    const interestBoost = skill.title.toLowerCase().split(' ').some(word => word.length > 3 && interestText.includes(word));
    return { ...skill, priority: index < 3 || interestBoost ? 'High' : skill.priority };
  });
}

function getRoadmap(goal: string, year: string): RoadmapItem[] {
  const config = getCareerConfig(goal);
  const early = year === '1st Year' || year === '2nd Year';
  const late = year === '4th Year' || year === 'Graduate';
  const focus = early ? 'Build the fundamentals and a small public habit.' : late ? 'Turn your strongest evidence into interview-ready proof.' : 'Go deeper, ship a major project, and prepare for internships.';
  return [
    { id: 'r1', week: 'STEP 01', title: early ? 'Set up your learning rhythm' : 'Audit your current signal', detail: `${focus} Start with ${config.skillIds.slice(0, 2).map(id => skillCatalog.find(skill => skill.id === id)?.title).join(' and ')}.`, kind: 'Foundation' },
    { id: 'r2', week: 'STEP 02', title: `Learn the core of ${goal}`, detail: `Work through the must-learn topics in ${skillCatalog.find(skill => skill.id === config.skillIds[2])?.title ?? 'your core skill'} and keep a short learning log.`, kind: 'Core' },
    { id: 'r3', week: 'STEP 03', title: 'Build your signal project', detail: `Create one practical proof of ${config.focus}. Keep the scope small enough for someone else to try.`, kind: 'Project' },
    { id: 'r4', week: 'STEP 04', title: late ? 'Run interview reps' : 'Get real feedback', detail: late ? `Practise ${config.interview.slice(0, 2).join(' and ')} and turn weak spots into focused sessions.` : 'Show your work to two people, record what confused them, and make one visible improvement.', kind: late ? 'Interview' : 'Feedback' },
    { id: 'r5', week: 'STEP 05', title: late ? 'Package your proof' : 'Tell the story', detail: late ? 'Polish your resume, GitHub, portfolio, and a two-minute project walkthrough.' : 'Publish a concise case study: context, decisions, result, and what you would do next.', kind: 'Job ready' },
  ];
}

const storage = {
  profile: 'careerskill.profile',
  assessment: 'careerskill.assessment',
  statuses: 'careerskill.skillStatuses',
  roadmap: 'careerskill.roadmap',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage can be unavailable in private mode */ }
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, testId }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'outline' | 'coral'; className?: string; type?: 'button' | 'submit'; disabled?: boolean; testId?: string;
}) {
  const variants = {
    primary: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110 shadow-[0_8px_22px_hsl(var(--primary)/.18)]',
    quiet: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    outline: 'border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/.6)] hover:text-[hsl(var(--primary))]',
    coral: 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105',
  };
  return <button type={type} disabled={disabled} onClick={onClick} data-testid={testId} className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>{children}</button>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-2.5" data-testid="brand-careerskill">
    <div className="relative flex size-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_6px_18px_hsl(var(--primary)/.24)]">
      <TrendingUp size={20} strokeWidth={2.7} />
      <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-[hsl(var(--background))] bg-[hsl(var(--accent))]" />
    </div>
    {!compact && <span className="display-font text-lg font-bold tracking-[-.04em]">Career<span className="text-[hsl(var(--primary))]">Skill</span></span>}
  </div>;
}

function Header({ hasPlan, mobileOpen, setMobileOpen }: { hasPlan: boolean; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const links = [
    { label: 'Skills', id: 'skills', icon: <ListChecks size={15} /> },
    { label: 'Roadmap', id: 'roadmap', icon: <Map size={15} /> },
    { label: 'Projects', id: 'projects', icon: <BriefcaseBusiness size={15} /> },
    { label: 'Insights', id: 'insights', icon: <BarChart3 size={15} /> },
  ];
  return <header className="sticky top-0 z-30 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.9)] backdrop-blur-xl">
    <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
      <button className="focus-ring rounded-lg" onClick={() => scrollToSection('top')} data-testid="button-home"><Logo /></button>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
        {links.map(link => <button key={link.id} onClick={() => scrollToSection(link.id)} disabled={!hasPlan} data-testid={`button-nav-${link.id}`} className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] disabled:cursor-not-allowed disabled:opacity-40">{link.icon}{link.label}</button>)}
      </nav>
      <div className="flex items-center gap-2">
        {hasPlan && <button onClick={() => scrollToSection('progress')} data-testid="button-header-progress" className="hidden items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-bold md:flex"><span className="size-2 rounded-full bg-[hsl(var(--accent))]" /> Your progress</button>}
        <button className="focus-ring rounded-lg p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Open navigation" data-testid="button-mobile-menu">{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
    {mobileOpen && <nav className="border-t border-[hsl(var(--border))] px-5 py-3 md:hidden" aria-label="Mobile navigation">
      {links.map(link => <button key={link.id} disabled={!hasPlan} onClick={() => { scrollToSection(link.id); setMobileOpen(false); }} className="flex w-full items-center gap-3 border-b border-[hsl(var(--border)/.55)] py-3 text-left text-sm font-bold disabled:opacity-40">{link.icon}{link.label}</button>)}
    </nav>}
  </header>;
}

function Welcome({ profile, setProfile, onGenerate }: { profile: Profile; setProfile: (p: Profile) => void; onGenerate: () => void }) {
  const [error, setError] = useState('');
  const [customMode, setCustomMode] = useState(() => Boolean(profile.goal && !CAREER_OPTIONS.includes(profile.goal)));
  const update = (key: keyof Profile, value: string) => setProfile({ ...profile, [key]: value });
  const selectedInterests = profile.interests ? profile.interests.split(', ').filter(Boolean) : [];
  const toggleInterest = (interest: string) => {
    const next = selectedInterests.includes(interest)
      ? selectedInterests.filter(item => item !== interest)
      : [...selectedInterests, interest];
    update('interests', next.join(', '));
  };
  const isCustomGoal = Boolean(profile.goal && !CAREER_OPTIONS.includes(profile.goal));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!profile.qualification) { setError('Please select your qualification before generating your plan.'); return; }
    if (!profile.branch) { setError('Please select your branch or major before generating your plan.'); return; }
    if (!profile.year) { setError('Please select your current year before generating your plan.'); return; }
    if (!profile.interests) { setError('Choose at least one interest so your plan can feel like yours.'); return; }
    if (!profile.goal.trim()) { setError('Please select your career goal before generating your plan.'); return; }
    setError('');
    onGenerate();
  };
  return <section id="top" className="app-grid relative overflow-hidden border-b border-[hsl(var(--border))]">
    <div className="pointer-events-none absolute -right-32 -top-32 size-[440px] rounded-full bg-[hsl(var(--secondary)/.8)] blur-3xl" />
    <div className="relative mx-auto grid max-w-[1240px] gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
      <div className="animate-rise max-w-2xl">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/.22)] bg-[hsl(var(--card)/.72)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))]"><Sparkles size={14} /> A clearer route from college to career</div>
        <h1 className="display-font text-balance text-5xl font-bold leading-[.98] tracking-[-.065em] text-[hsl(var(--foreground))] sm:text-7xl">Your next chapter<br /><span className="text-[hsl(var(--primary))]">starts with a plan.</span></h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">CareerSkill turns the things you care about into a focused set of skills, projects, and weekly moves — so you always know what to do next.</p>
        <div className="mt-9 flex flex-wrap items-center gap-5 text-xs font-bold text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-2"><Target size={15} className="text-[hsl(var(--accent))]" /> Built around your goal</span><span className="flex items-center gap-2"><LockKeyhole size={15} className="text-[hsl(var(--primary))]" /> Private on your device</span></div>
      </div>
      <form onSubmit={submit} className="animate-rise animation-delay-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.82)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-7" data-testid="form-profile">
        <div className="mb-6 flex items-start justify-between"><div><p className="mono-font text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">01 / Your starting point</p><h2 className="display-font mt-2 text-2xl font-bold tracking-[-.04em]">Give us a little context.</h2></div><div className="rounded-lg bg-[hsl(var(--secondary))] p-2 text-[hsl(var(--primary))]"><Crosshair size={19} /></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Qualification" value={profile.qualification} onChange={v => update('qualification', v)} options={QUALIFICATIONS} testId="select-qualification" />
          <SelectField label="Branch / major" value={profile.branch} onChange={v => update('branch', v)} options={BRANCHES} testId="select-branch" />
          <SelectField label="Current year" value={profile.year} onChange={v => update('year', v)} options={YEARS} testId="select-year" />
          <div className="sm:col-span-2">
            <span className="mb-2 block text-xs font-bold text-[hsl(var(--muted-foreground))]">Interests <span className="font-normal">choose all that fit</span></span>
            <div className="flex flex-wrap gap-2" data-testid="interest-options">
              {INTEREST_OPTIONS.map(interest => <button type="button" key={interest} onClick={() => toggleInterest(interest)} className={`rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${selectedInterests.includes(interest) ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.55)]'}`} aria-pressed={selectedInterests.includes(interest)} data-testid={`interest-${interest.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{interest}</button>)}
            </div>
          </div>
        </div>
        <label className="mt-5 block"><span className="mb-1.5 block text-xs font-bold text-[hsl(var(--muted-foreground))]">Target career</span><select value={customMode ? '__custom__' : profile.goal} onChange={e => { const value = e.target.value; setCustomMode(value === '__custom__'); update('goal', value === '__custom__' ? '' : value); }} className="focus-ring w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none" data-testid="select-career-goal"><option value="">Choose a target career</option>{CAREER_OPTIONS.map(career => <option key={career}>{career}</option>)}<option value="__custom__">Other / custom career goal</option></select></label>
        {customMode && <Field label="Custom career goal" value={isCustomGoal ? profile.goal : ''} onChange={v => update('goal', v)} placeholder="e.g. Product manager, Game developer..." testId="input-custom-goal" />}
        {error && <p className="mt-3 text-xs font-semibold text-[hsl(var(--destructive))]" role="alert" data-testid="status-profile-error">{error}</p>}
        <Button type="submit" className="mt-6 w-full py-3" testId="button-generate-plan">Generate my plan <ArrowRight size={17} /></Button>
        <p className="mt-3 text-center text-[11px] text-[hsl(var(--muted-foreground))]">Takes about 30 seconds. You can change direction anytime.</p>
      </form>
    </div>
  </section>;
}

function Field({ label, value, onChange, placeholder, testId }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; testId: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-[hsl(var(--muted-foreground))]">{label}</span><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="focus-ring w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground)/.7)]" data-testid={testId} /></label>;
}

function SelectField({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (value: string) => void; options: string[]; testId: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-[hsl(var(--muted-foreground))]">{label}</span><select value={value} onChange={e => onChange(e.target.value)} className="focus-ring w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none" data-testid={testId}><option value="">Choose {label.toLowerCase()}</option>{options.map(option => <option key={option}>{option}</option>)}</select></label>;
}

function PlanIntro({ profile, score, onReset }: { profile: Profile; score: number; onReset: () => void }) {
  const goal = profile.goal || 'Product-minded technologist';
  return <section className="mx-auto max-w-[1240px] px-5 pt-12 lg:px-8 lg:pt-16">
    <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--foreground))] px-6 py-8 text-[hsl(var(--background))] sm:px-9 sm:py-10">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--primary)/.3),transparent_56%)]" />
      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div><div className="mb-4 flex items-center gap-2 text-xs font-bold text-[hsl(var(--accent))]"><span className="size-2 rounded-full bg-[hsl(var(--accent))]" /> PLAN READY · PERSONALIZED FOR YOU</div><h2 className="display-font max-w-2xl text-3xl font-bold leading-tight tracking-[-.05em] sm:text-4xl">A practical route toward<br /><span className="text-[hsl(var(--primary))]">{goal}.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-[hsl(var(--background)/.68)]">For a {profile.year} {profile.branch} student who is curious about {profile.interests}.</p></div>
        <div className="flex shrink-0 items-center gap-5 rounded-xl border border-[hsl(var(--background)/.15)] bg-[hsl(var(--background)/.06)] px-4 py-3"><div className="relative flex size-14 items-center justify-center rounded-full border-[5px] border-[hsl(var(--background)/.14)] text-lg font-bold"><span className="absolute inset-[-5px] rounded-full border-[5px] border-[hsl(var(--accent))] border-l-transparent" />{score}%</div><div><p className="text-sm font-bold">Plan momentum</p><p className="text-xs text-[hsl(var(--background)/.58)]">Keep showing up</p></div></div>
      </div>
      <button onClick={onReset} className="relative mt-7 flex items-center gap-1 text-xs font-bold text-[hsl(var(--background)/.6)] transition-colors hover:text-[hsl(var(--background))]" data-testid="button-reset-plan"><RotateCcw size={13} /> Reset and start again</button>
    </div>
  </section>;
}

function SectionHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mono-font mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">{eyebrow}</p><h2 className="display-font text-3xl font-bold tracking-[-.05em]">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{detail}</p></div>{action}</div>;
}

function SkillsSection({ skills, statuses, setStatuses, onOpen }: { skills: Skill[]; statuses: Record<string, string>; setStatuses: (v: Record<string, string>) => void; onOpen: (s: Skill) => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Foundation', 'Core', 'Advanced', 'Career edge', 'Completed', 'In progress', 'Not started'];
  const visible = skills.filter(skill => {
    const status = statuses[skill.id] || 'not started';
    const matchesFilter = filter === 'All' || skill.category === filter || status === filter.toLowerCase();
    return matchesFilter && `${skill.title} ${skill.description} ${skill.topics.join(' ')}`.toLowerCase().includes(query.toLowerCase());
  });
  const cycleStatus = (id: string) => { const order = ['not started', 'in progress', 'complete']; const next = order[(order.indexOf(statuses[id] || 'not started') + 1) % order.length]; setStatuses({ ...statuses, [id]: next }); };
  return <section id="skills" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-20 lg:px-8">
    <SectionHeading eyebrow="02 / Your skill stack" title="Build the skills that compound." detail="A focused mix of foundations, practical craft, and career edge. Mark a skill as you move so your plan reflects reality." />
    <div className="mb-5 flex flex-col gap-3"><div className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Python, SQL, React..." className="focus-ring w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--card))] py-2.5 pl-10 pr-3 text-sm outline-none" data-testid="input-skill-search" /></div><div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[hsl(var(--border))] p-1"><Filter size={15} className="ml-2 mr-1 shrink-0 text-[hsl(var(--muted-foreground))]" />{filters.map(option => <button key={option} onClick={() => setFilter(option)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${filter === option ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'}`} data-testid={`button-filter-${option.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{option}</button>)}</div></div>
    {visible.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((skill, index) => {
      const status = statuses[skill.id] || 'not started';
      const progress = status === 'complete' ? 100 : status === 'in progress' ? 45 : 0;
      return <article key={skill.id} onClick={() => onOpen(skill)} className={`animate-rise cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[hsl(var(--primary)/.4)] hover:shadow-[var(--shadow-soft)] animation-delay-${Math.min(index + 1, 3)}`} data-testid={`card-skill-${skill.id}`}>
      <div className="flex items-start justify-between"><div className="flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">{skill.icon}</div><button onClick={e => { e.stopPropagation(); cycleStatus(skill.id); }} className={`focus-ring rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${status === 'complete' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : status === 'in progress' ? 'bg-[hsl(var(--accent)/.18)] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-status-${skill.id}`}>{status}</button></div>
      <div className="mt-5 flex items-center justify-between"><p className="mono-font text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">{skill.category} · {skill.level}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${skill.priority === 'High' ? 'bg-[hsl(var(--accent)/.18)] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>{skill.priority} priority</span></div><h3 className="mt-1.5 text-lg font-bold tracking-[-.03em]">{skill.title}</h3><p className="mt-2 min-h-[66px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">{skill.description}</p><div className="mt-4 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${progress}%` }} /></div><span className="mono-font text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{progress}%</span></div><button onClick={e => { e.stopPropagation(); onOpen(skill); }} className="focus-ring mt-4 flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] transition-all hover:gap-2" data-testid={`button-details-${skill.id}`}>View important topics <ChevronRight size={14} /></button>
    </article>;})}</div> : <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-14 text-center"><Search className="mx-auto text-[hsl(var(--muted-foreground))]" /><p className="mt-3 text-sm font-bold">Nothing matches that search.</p><button onClick={() => { setQuery(''); setFilter('All'); }} className="mt-2 text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-clear-search">Clear filters</button></div>}
  </section>;
}

function SkillModal({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  useEffect(() => { const listener = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', listener); const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', listener); document.body.style.overflow = old; }; }, [onClose]);
  const mustLearn = skill.topics.slice(0, Math.max(2, Math.ceil(skill.topics.length / 2)));
  const important = skill.topics.slice(mustLearn.length, Math.max(mustLearn.length + 2, skill.topics.length - 1));
  const later = skill.topics.slice(mustLearn.length + important.length);
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--foreground)/.45)] p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} role="presentation">
    <div className="animate-rise w-full max-w-lg rounded-t-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="skill-modal-title" data-testid="modal-skill-detail">
      <div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">{skill.icon}</div><div><p className="mono-font text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--primary))]">{skill.category} · {skill.priority} priority</p><h2 id="skill-modal-title" className="display-font text-xl font-bold tracking-[-.04em]">{skill.title}</h2><p className="mt-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">Suggested level: {skill.level}</p></div></div><button onClick={onClose} className="focus-ring rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Close topic details" data-testid="button-close-modal"><X size={18} /></button></div>
      <p className="mt-6 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{skill.description}</p><div className="mt-5 rounded-lg bg-[hsl(var(--secondary)/.55)] p-4"><p className="text-xs font-bold text-[hsl(var(--foreground))]">Why this matters for your career</p><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{skill.reason}</p></div><div className="mt-6 grid gap-5 sm:grid-cols-3">{[['MUST LEARN', mustLearn], ['IMPORTANT', important], ['LEARN LATER', later]].map(([label, topics]) => <div key={label as string}><h3 className="mono-font text-[10px] font-bold tracking-[.14em] text-[hsl(var(--primary))]">{label as string}</h3><div className="mt-3 space-y-2">{(topics as string[]).map(topic => <div key={topic} className="flex items-start gap-2 text-xs leading-5"><span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/.14)] text-[hsl(var(--primary))]"><Check size={10} strokeWidth={3} /></span>{topic}</div>)}</div></div>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-[hsl(var(--border))] p-3"><p className="text-xs font-bold">What to practise</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Learn the concept, solve 3–5 focused problems, then build a small practical example.</p></div><div className="rounded-lg border border-[hsl(var(--border))] p-3"><p className="text-xs font-bold">Quick strategy</p><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Understand → practise → build → review. Repeat until the idea feels usable.</p></div></div><Button onClick={onClose} className="mt-7 w-full" testId="button-modal-done">Got it, keep moving <ArrowRight size={16} /></Button>
    </div>
  </div>;
}

function Assessment({ goal, assessment, setAssessment }: { goal: string; assessment: number | null; setAssessment: (v: number) => void }) {
  const [selected, setSelected] = useState<(number | null)[]>([null, null, null, null]);
  const [submitted, setSubmitted] = useState(assessment !== null);
  const questions = [`I can explain the core work of a ${goal}.`, `I have made something I am comfortable showing others.`, `I know which ${goal} skill would make the biggest difference next.`, 'I can describe my strengths without underselling them.'];
  const answers = ['Not yet', 'A little', 'Mostly', 'Yes, confidently'];
  const submit = () => { const answered = selected.filter((value): value is number => value !== null); if (answered.length) { setAssessment(Math.round(answered.reduce((total, value) => total + value, 0) / (answered.length * 3) * 100)); setSubmitted(true); } };
  return <section id="assessment" className="scroll-mt-24 border-y border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)]"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
    <div><p className="mono-font mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[hsl(var(--primary))]">03 / Quick check-in</p><h2 className="display-font text-3xl font-bold leading-tight tracking-[-.05em]">Know your starting line.</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">A four-question pulse check. No grades — just a more honest next step.</p><div className="mt-7 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--card))] text-[hsl(var(--primary))]"><Crosshair size={18} /></div><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">You can retake this whenever<br />your confidence changes.</p></div></div>
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-7"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4"><p className="text-sm font-bold">Confidence pulse</p>{submitted && <span className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]"><Check size={14} /> Saved{assessment !== null ? ` · ${assessment}%` : ''}</span>}</div><div className="mt-5 space-y-5">{questions.map((question, index) => <div key={question}><p className="text-sm font-semibold"><span className="mono-font mr-2 text-xs text-[hsl(var(--primary))]">0{index + 1}</span>{question}</p><div className="mt-2 flex flex-wrap gap-2">{answers.map((answer, answerIndex) => <button key={answer} onClick={() => { setSelected(selected.map((value, selectedIndex) => selectedIndex === index ? answerIndex : value)); setSubmitted(false); }} className={`focus-ring rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${selected[index] === answerIndex && !submitted ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.55)]'}`} data-testid={`button-assessment-${index}-${answerIndex}`}>{answer}</button>)}</div></div>)}</div><Button onClick={submit} disabled={!selected.some(value => value !== null)} className="mt-6 w-full" testId="button-save-assessment">{submitted ? 'Update my check-in' : 'Save my check-in'} <ArrowRight size={16} /></Button></div>
  </div></section>;
}

function RoadmapSection({ roadmap, completed, setCompleted }: { roadmap: RoadmapItem[]; completed: string[]; setCompleted: (v: string[]) => void }) {
  const toggle = (id: string) => setCompleted(completed.includes(id) ? completed.filter(item => item !== id) : [...completed, id]);
  return <section id="roadmap" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-20 lg:px-8"><SectionHeading eyebrow="04 / Your next five weeks" title="Small moves. Visible proof." detail="A momentum-first roadmap designed to get you from intention to something you can point at." action={<span className="mono-font text-xs font-bold text-[hsl(var(--muted-foreground))]">{completed.length} / {roadmap.length} COMPLETE</span>} /><div className="relative ml-2 border-l border-[hsl(var(--border))] pl-7 sm:ml-4 sm:pl-10">{roadmap.map((item, index) => { const done = completed.includes(item.id); return <div key={item.id} className="relative pb-8 last:pb-0"><div className={`absolute -left-[39px] top-0 flex size-7 items-center justify-center rounded-full border-4 border-[hsl(var(--background))] ${done ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}><span className="mono-font text-[10px] font-bold">{done ? <Check size={13} /> : `0${index + 1}`}</span></div><div className={`rounded-xl border p-4 transition-all sm:p-5 ${done ? 'border-[hsl(var(--primary)/.35)] bg-[hsl(var(--secondary)/.38)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:shadow-[var(--shadow-soft)]'}`}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="mono-font text-[10px] font-bold tracking-[.12em] text-[hsl(var(--primary))]">{item.week}</span><span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">{item.kind}</span></div><h3 className={`mt-2 text-base font-bold ${done ? 'line-through decoration-[hsl(var(--primary))] decoration-2' : ''}`}>{item.title}</h3><p className="mt-1.5 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.detail}</p></div><Button variant={done ? 'quiet' : 'outline'} onClick={() => toggle(item.id)} className="shrink-0 self-start" testId={`button-roadmap-${item.id}`}>{done ? <><Check size={15} /> Completed</> : <><Circle size={15} /> Mark complete</>}</Button></div></div></div>; })}</div></section>;
}

function Projects({ goal }: { goal: string }) {
  const items = getCareerConfig(goal).projects;
  const icons = [<Palette size={19} />, <BarChart3 size={19} />, <BriefcaseBusiness size={19} />];
  return <section id="projects" className="scroll-mt-24 bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"><div className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8"><SectionHeading eyebrow="05 / Proof, not busywork" title={`Projects for ${goal}.`} detail="Skip the tutorial clone. Each prompt gives you a reason to build, a person to help, and a story to tell." /><div className="grid gap-4 lg:grid-cols-3">{items.map((item, index) => <article key={item.title} className="group rounded-xl border border-[hsl(var(--background)/.15)] bg-[hsl(var(--background)/.05)] p-5 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary)/.65)] hover:bg-[hsl(var(--background)/.08)]" data-testid={`card-project-${index}`}><div className="flex size-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">{icons[index]}</div><p className="mono-font mt-6 text-[10px] font-bold uppercase tracking-[.15em] text-[hsl(var(--accent))]">{item.tag} · {item.difficulty}</p><h3 className="mt-2 text-lg font-bold tracking-[-.03em]">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--background)/.63)]">{item.detail}</p><p className="mt-4 text-[11px] font-semibold text-[hsl(var(--background)/.6)]">Uses {item.skills} · Best after {item.after}</p><button onClick={() => window.alert(`Saved to your project ideas: ${item.title}`)} className="mt-5 flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] transition-all group-hover:gap-2" data-testid={`button-project-${index}`}>Save this idea <ArrowRight size={14} /></button></article>)}</div></div></section>;
}

function Progress({ skills, roadmap, statuses, completed, assessment }: { skills: Skill[]; roadmap: RoadmapItem[]; statuses: Record<string, string>; completed: string[]; assessment: number | null }) {
  const completedSkills = skills.filter(skill => statuses[skill.id] === 'complete').length;
  const score = Math.round((completedSkills / skills.length) * 60 + (completed.length / roadmap.length) * 25 + (assessment !== null ? 15 : 0));
  return <section id="progress" className="scroll-mt-24 border-t border-[hsl(var(--border))]"><div className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8"><SectionHeading eyebrow="06 / Keep the loop going" title="Progress you can feel." detail="Your workspace remembers the small wins, so a good week stays visible when a busy one arrives." /><div className="grid gap-4 md:grid-cols-[1.15fr_.85fr]"><div className="rounded-xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] sm:p-8"><div className="flex items-start justify-between"><div><p className="mono-font text-[10px] font-bold uppercase tracking-[.17em] opacity-70">Current momentum</p><p className="display-font mt-3 text-6xl font-bold tracking-[-.08em]">{score}<span className="text-2xl opacity-60">%</span></p><p className="mt-2 text-sm opacity-75">{score >= 70 ? 'You are building a strong signal.' : 'A little progress is still progress.'}</p></div><Flame size={27} /></div><div className="mt-9 h-2 overflow-hidden rounded-full bg-[hsl(var(--primary-foreground)/.18)]"><div className="progress-line h-full rounded-full bg-[hsl(var(--accent))]" style={{ '--progress': `${score}%` } as CSSProperties} /></div><div className="mt-3 flex justify-between text-[10px] font-bold opacity-65"><span>START</span><span>YOUR NEXT ROLE</span></div></div><div className="grid grid-cols-3 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5"><Metric value={completedSkills} total={skills.length} label="Skills complete" icon={<Zap size={16} />} /><Metric value={completed.length} total={roadmap.length} label="Roadmap moves" icon={<Map size={16} />} /><Metric value={assessment !== null ? 1 : 0} total={1} label="Check-in done" icon={<Crosshair size={16} />} /></div></div></div></section>;
}

function Metric({ value, total, label, icon }: { value: number; total: number; label: string; icon: ReactNode }) {
  return <div className="flex flex-col justify-between rounded-lg bg-[hsl(var(--muted)/.55)] p-3"><div className="flex items-center justify-between text-[hsl(var(--primary))]">{icon}<span className="mono-font text-[10px] font-bold">{value}/{total}</span></div><p className="mt-8 text-xs font-bold leading-4">{label}</p></div>;
}

function Insights({ profile }: { profile: Profile }) {
  const config = getCareerConfig(profile.goal);
  return <section id="insights" className="scroll-mt-24 border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)]"><div className="mx-auto max-w-[1240px] px-5 py-20 lg:px-8"><SectionHeading eyebrow="07 / Career insights" title={profile.goal} detail={`A grounded view for a ${profile.year} ${profile.branch} student focused on ${config.focus}.`} /><div className="grid gap-4 md:grid-cols-2"><article className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><p className="mono-font text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Common job roles</p><div className="mt-4 flex flex-wrap gap-2">{config.roles.map(role => <span key={role} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-bold">{role}</span>)}</div><p className="mono-font mt-7 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Technologies</p><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{config.technologies.join(' · ')}</p></article><article className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><p className="mono-font text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--primary))]">Interview preparation</p><div className="mt-4 space-y-3">{config.interview.map((item, index) => <div key={item} className="flex items-start gap-3 text-sm"><span className="mono-font text-xs font-bold text-[hsl(var(--accent))]">0{index + 1}</span>{item}</div>)}</div><p className="mt-7 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Companies look for strong fundamentals, clear problem solving, evidence from projects, and communication that makes your decisions easy to follow.</p></article></div></div></section>;
}

function Insight({ number, title, body }: { number: string; title: string; body: string }) {
  return <article className="border-t-2 border-[hsl(var(--primary))] pt-4"><p className="mono-font text-xs font-bold text-[hsl(var(--accent))]">{number}</p><h3 className="mt-8 text-lg font-bold tracking-[-.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p></article>;
}

function Footer() {
  return <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center lg:px-8"><Logo /><p className="text-xs text-[hsl(var(--muted-foreground))]">Your career is a series of next steps. Make this one count.</p><button onClick={() => scrollToSection('top')} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]" data-testid="button-back-top">Back to top <ArrowRight size={13} className="-rotate-90" /></button></div></footer>;
}

function Home() {
  const [profile, setProfile] = useState<Profile>(() => readStorage(storage.profile, defaultProfile));
  const [hasPlan, setHasPlan] = useState(() => Boolean(readStorage<Profile | null>(storage.profile, null)?.goal && localStorage.getItem(storage.profile)));
  const [statuses, setStatuses] = useState<Record<string, string>>(() => readStorage(storage.statuses, {}));
  const [completed, setCompleted] = useState<string[]>(() => readStorage(storage.roadmap, []));
  const [assessment, setAssessment] = useState<number | null>(() => readStorage<number | null>(storage.assessment, null));
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const planSkills = getSkillsForGoal(profile.goal || 'Software Developer', profile.interests);
  const planRoadmap = getRoadmap(profile.goal || 'Software Developer', profile.year);
  const score = Math.round((planSkills.filter(skill => statuses[skill.id] === 'complete').length / planSkills.length) * 60 + (completed.length / planRoadmap.length) * 25 + (assessment !== null ? 15 : 0));
  useEffect(() => saveStorage(storage.profile, profile), [profile]);
  useEffect(() => saveStorage(storage.statuses, statuses), [statuses]);
  useEffect(() => saveStorage(storage.roadmap, completed), [completed]);
  useEffect(() => saveStorage(storage.assessment, assessment), [assessment]);
  const generate = () => { const next = { ...profile, goal: profile.goal.trim() }; setProfile(next); setHasPlan(true); window.setTimeout(() => scrollToSection('skills'), 80); };
  const reset = () => { if (window.confirm('Reset your CareerSkill workspace? Your saved plan and progress will be cleared.')) { Object.values(storage).forEach(key => localStorage.removeItem(key)); setProfile(defaultProfile); setHasPlan(false); setStatuses({}); setCompleted([]); setAssessment(null); scrollToSection('top'); } };
  return <div className="min-h-[100dvh] bg-[hsl(var(--background))]"><Header hasPlan={hasPlan} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /><Welcome profile={profile} setProfile={setProfile} onGenerate={generate} />{hasPlan && <><PlanIntro profile={profile} score={score} onReset={reset} /><main><SkillsSection skills={planSkills} statuses={statuses} setStatuses={setStatuses} onOpen={setSelectedSkill} /><Assessment goal={profile.goal} assessment={assessment} setAssessment={setAssessment} /><RoadmapSection roadmap={planRoadmap} completed={completed} setCompleted={setCompleted} /><Projects goal={profile.goal} /><Progress skills={planSkills} roadmap={planRoadmap} statuses={statuses} completed={completed} assessment={assessment} /><Insights profile={profile} /></main><Footer /></>}{selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}</div>;
}

const queryClient = new QueryClient();

function Router() {
  return <ErrorBoundary resetKey={useLocation()[0]}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;