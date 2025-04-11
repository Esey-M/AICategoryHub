const fs = require('fs');
const path = require('path');

// Define category mapping
const categoryMap = {
  "chatbots-conversational-ai": "Chatbots & Conversational AI",
  "image-generation-editing": "Image Generation & Editing",
  "text-generation-writing-assistance": "Text Generation & Writing Assistance",
  "speech-recognition-synthesis": "Speech Recognition & Synthesis",
  "code-generation-development-assistance": "Code Generation & Development Assistance",
  "video-editing-generation": "Video Editing & Generation",
  "marketing-seo": "Marketing & SEO",
  "data-analysis-visualization": "Data Analysis & Visualization",
  "predictive-analytics-forecasting": "Predictive Analytics & Forecasting",
  "virtual-reality-augmented-reality": "Virtual Reality & Augmented Reality",
  "healthcare-medicine": "Healthcare & Medicine",
  "voice-assistants-automation": "Voice Assistants & Automation",
  "robotics-automation": "Robotics & Automation",
  "finance-trading": "Finance & Trading",
  "sentiment-analysis-opinion-mining": "Sentiment Analysis & Opinion Mining",
  "language-translation-localization": "Language Translation & Localization",
  "facial-recognition-computer-vision": "Facial Recognition & Computer Vision",
  "ai-for-education-e-learning": "AI for Education & E-Learning",
  "ai-for-cybersecurity-fraud-detection": "AI for Cybersecurity & Fraud Detection",
  "ethical-ai-bias-detection": "Ethical AI & Bias Detection"
};

// Category descriptions for SEO
const categoryDescriptions = {
  "chatbots-conversational-ai": "Tools for building intelligent chatbots and virtual assistants for customer service, sales, and automation.",
  "image-generation-editing": "AI tools for creating and enhancing images, artwork, and visual content.",
  "text-generation-writing-assistance": "Tools that assist with writing, content creation, and text generation for marketing, blogs, and more.",
  "speech-recognition-synthesis": "Tools for transcribing speech and generating synthetic voices for various applications.",
  "code-generation-development-assistance": "Tools that aid in coding and software development, improving developer productivity.",
  "video-editing-generation": "Tools for creating and editing videos, enhancing content, and automating video production.",
  "marketing-seo": "AI tools for marketing optimization, SEO improvement, and content strategy.",
  "data-analysis-visualization": "AI tools for analyzing and visualizing complex datasets and business intelligence.",
  "predictive-analytics-forecasting": "Tools for making predictions and forecasts for business planning and strategy.",
  "virtual-reality-augmented-reality": "AI tools for VR and AR development, 3D modeling, and immersive experiences.",
  "healthcare-medicine": "AI tools for healthcare and medical applications, diagnostics, and patient care.",
  "voice-assistants-automation": "Tools for voice-based automation and virtual assistant implementation.",
  "robotics-automation": "AI tools for robotics and business process automation solutions.",
  "finance-trading": "AI tools for financial analysis, trading strategies, and investment decisions.",
  "sentiment-analysis-opinion-mining": "Tools for analyzing customer sentiment and mining opinions from text data.",
  "language-translation-localization": "AI tools for translation, localization, and multilingual content creation.",
  "facial-recognition-computer-vision": "Tools for processing images, detecting faces, and implementing computer vision.",
  "ai-for-education-e-learning": "AI tools for education, online learning, and student engagement.",
  "ai-for-cybersecurity-fraud-detection": "Tools for security, fraud prevention, and threat detection.",
  "ethical-ai-bias-detection": "Tools for promoting fairness, detecting bias, and ensuring ethical AI deployment."
};

// Sample tools for each category (to provide content for search engines)
const categoryTools = {
  "chatbots-conversational-ai": ["ChatBot.com", "LiveChat", "ManyChat", "Tidio", "MobileMonkey", "Botpress"],
  "image-generation-editing": ["Midjourney", "DALL-E", "PhotoRoom", "NightCafe Creator", "Stable Diffusion", "Leonardo.AI"],
  "text-generation-writing-assistance": ["Jasper", "Copy.ai", "Writesonic", "ContentBot", "Rytr", "Wordtune"],
  "speech-recognition-synthesis": ["Descript", "Otter.ai", "Rev", "Murf.ai", "Play.ht", "Resemble.ai"],
  "code-generation-development-assistance": ["Tabnine", "GitHub Copilot", "Amazon CodeWhisperer", "Cursor", "Replit GhostWriter", "ChatGPT"],
  "video-editing-generation": ["Descript", "Runway", "Synthesia", "HeyGen", "D-ID", "Elai"],
  "marketing-seo": ["Surfer SEO", "SE Ranking", "Ahrefs", "Jasper", "Semrush", "MarketMuse"],
  "data-analysis-visualization": ["Tableau", "Dataiku", "Sigma Computing", "ThoughtSpot", "Census", "Datalore"],
  "predictive-analytics-forecasting": ["BigML", "Pecan AI", "Akkio", "Obviously AI", "Apteo", "Knime"],
  "virtual-reality-augmented-reality": ["Matterport", "Niantic Lightship", "Blippar", "Gravity Sketch", "Varjo", "Spatial"],
  "healthcare-medicine": ["Ada Health", "Babylon Health", "Diagnoss", "BioXcel", "Owkin", "Atomwise"],
  "voice-assistants-automation": ["SoundHound", "Voiceflow", "Alan AI", "Picovoice", "Botpress", "Jovo"],
  "robotics-automation": ["WorkFusion", "Automation Hero", "Hyperscience", "Rossum", "Rapid Robotics", "Bright Machines"],
  "finance-trading": ["Alpaca", "QuantConnect", "Kavout", "Sentifi", "Kensho", "Tickeron"],
  "sentiment-analysis-opinion-mining": ["Brandwatch", "Lexalytics", "Repustate", "MonkeyLearn", "Talkwalker", "Clarabridge"],
  "language-translation-localization": ["DeepL", "Smartling", "Phrase", "Unbabel", "Lokalise", "XTM International"],
  "facial-recognition-computer-vision": ["Clarifai", "Kairos", "Azure Computer Vision", "OpenCV", "DeepFace", "Luxand FaceSDK"],
  "ai-for-education-e-learning": ["NoRedInk", "Carnegie Learning", "Gradescope", "Duolingo", "Century Tech", "QuillBot"],
  "ai-for-cybersecurity-fraud-detection": ["Darktrace", "CrowdStrike", "DataVisor", "Auth0", "Sift", "Cybereason"],
  "ethical-ai-bias-detection": ["Fairlearn", "IBM AI Fairness 360", "TensorFlow Model Analysis", "Fiddler AI", "What-If Tool", "Arize AI"]
};

// Use cases for each category
const categoryUseCases = {
  "chatbots-conversational-ai": ["Customer support automation", "Lead generation", "E-commerce assistance", "FAQ handling", "Appointment scheduling"],
  "image-generation-editing": ["Product photography", "Marketing visuals", "Art creation", "Background removal", "Style transfer"],
  "text-generation-writing-assistance": ["Blog content creation", "Marketing copy", "Email templates", "Product descriptions", "SEO content optimization"],
  "speech-recognition-synthesis": ["Meeting transcription", "Voiceover creation", "Podcast editing", "Voice cloning", "Accessibility features"],
  "code-generation-development-assistance": ["Code completion", "Bug detection", "Refactoring suggestions", "Documentation generation", "Test creation"],
  "video-editing-generation": ["Automated video editing", "Text-to-video generation", "Virtual presenter creation", "Video content repurposing", "AI avatars"],
  "marketing-seo": ["Content optimization", "Keyword research", "Competitor analysis", "Conversion rate optimization", "Social media content creation"],
  "data-analysis-visualization": ["Business intelligence", "Customer insights", "Performance dashboards", "Data storytelling", "Trend identification"],
  "predictive-analytics-forecasting": ["Sales forecasting", "Demand prediction", "Risk assessment", "Customer churn prediction", "Price optimization"],
  "virtual-reality-augmented-reality": ["Product visualization", "Virtual training", "AR marketing campaigns", "3D modeling", "Immersive experiences"],
  "healthcare-medicine": ["Diagnostic assistance", "Medical imaging analysis", "Drug discovery", "Patient monitoring", "Healthcare operations"],
  "voice-assistants-automation": ["Smart home control", "Customer service", "Voice commerce", "Voice search optimization", "Voice UX design"],
  "robotics-automation": ["Process automation", "Document processing", "Customer service automation", "Manufacturing robotics", "Supply chain optimization"],
  "finance-trading": ["Algorithmic trading", "Risk assessment", "Fraud detection", "Portfolio optimization", "Market prediction"],
  "sentiment-analysis-opinion-mining": ["Brand monitoring", "Customer feedback analysis", "Social media monitoring", "Product review insights", "Market research"],
  "language-translation-localization": ["Website localization", "Content translation", "Multilingual customer support", "App localization", "Document translation"],
  "facial-recognition-computer-vision": ["Security systems", "User authentication", "Emotion detection", "Object detection", "Image classification"],
  "ai-for-education-e-learning": ["Personalized learning", "Automated grading", "Student engagement", "Content creation", "Language learning"],
  "ai-for-cybersecurity-fraud-detection": ["Threat detection", "Anomaly detection", "Fraud prevention", "Identity verification", "Vulnerability scanning"],
  "ethical-ai-bias-detection": ["Fairness evaluation", "Bias detection", "Responsible AI deployment", "Transparency tools", "AI governance"]
};

// Create HTML template for each category
function createCategoryPage(slug, name) {
  const description = categoryDescriptions[slug] || `AI tools for ${name.toLowerCase()}`;
  const tools = categoryTools[slug] || [];
  const useCases = categoryUseCases[slug] || [];
  
  const toolsList = tools.map(tool => `<li>${tool}</li>`).join('\n            ');
  const useCasesList = useCases.map(useCase => `<li>${useCase}</li>`).join('\n            ');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - AI Category Hub</title>
    <meta name="description" content="Discover the best AI tools for ${name.toLowerCase()}. ${description}">
    <link rel="canonical" href="https://aicategoryhub.net/category/${slug}/">
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="AI ${name} Tools - AI Category Hub">
    <meta property="og:description" content="Explore our curated collection of AI-powered ${name.toLowerCase()} tools to enhance your workflow.">
    <meta property="og:url" content="https://aicategoryhub.net/category/${slug}/">
    <meta property="og:type" content="website">
    
    <!-- Preload the main page -->
    <link rel="preload" href="/" as="document">
    
    <script>
    // Store the category to show
    sessionStorage.setItem('requested_category', '${slug}');
    
    // Redirect to the main page which will handle showing the right category
    window.location.replace('/');
    </script>
</head>
<body>
    <h1>${name} AI Tools</h1>
    <p>Discover the best AI tools for ${name.toLowerCase()}. This page helps you compare top AI solutions for ${name.toLowerCase()}.</p>
    
    <p>Redirecting to <a href="/">AI Category Hub</a>...</p>
    
    <!-- Include basic content for search engines -->
    <div style="display:none">
        <h2>Popular ${name} AI Tools</h2>
        <ul>
            ${toolsList}
        </ul>
        
        <h2>Common Use Cases</h2>
        <ul>
            ${useCasesList}
        </ul>
    </div>
</body>
</html>`;

  return html;
}

// Ensure directories exist
Object.keys(categoryMap).forEach(slug => {
  const dirPath = path.join('category', slug);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  
  // Create index.html file
  const filePath = path.join(dirPath, 'index.html');
  const content = createCategoryPage(slug, categoryMap[slug]);
  
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
});

console.log('All category pages created successfully!'); 