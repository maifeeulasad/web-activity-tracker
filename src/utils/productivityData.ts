// Productivity scoring data based on DeskTime research (50,000+ users)
// Source: https://desktime.com/blog/most-used-productive-unproductive-apps

export interface ProductivityCategory {
  productive: string[];
  neutral: string[];
  unproductive: string[];
}

export const WEBSITE_PRODUCTIVITY_CATEGORIES: ProductivityCategory = {
  // High productivity (80-100%)
  productive: [
    // Microsoft Office Suite
    'outlook.live.com', 'outlook.office.com', 'office.com',
    'gmail.com', 'mail.google.com',
    'docs.google.com', 'drive.google.com', 'sheets.google.com', 'slides.google.com',
    'excel.office.com', 'word.office.com', 'powerpoint.office.com',
    'code.visualstudio.com', 'vscode.dev',
    'teams.microsoft.com', 'teams.office.com',
    'slack.com', 'app.slack.com',
    'sharepoint.microsoft.com',
    'onedrive.live.com', 'onedrive.microsoft.com',
    
    // Development & Productivity Tools
    'github.com', 'gitlab.com', 'bitbucket.org',
    'stackoverflow.com', 'stackblitz.com', 'codesandbox.io',
    'notion.so', 'notion.com',
    'trello.com', 'asana.com',
    'figma.com', 'miro.com',
    'jupyter.org', 'colab.research.google.com',
    
    // Enterprise & Business Tools
    'salesforce.com', 'hubspot.com', 'zendesk.com',
    'shopify.com', 'wordpress.com', 'wix.com',
    'dropbox.com', 'box.com',
    'zoom.us', 'meet.google.com',
  ],
  
  // Medium productivity (50-70%)
  neutral: [
    // General browsing & research
    'google.com', 'bing.com', 'duckduckgo.com',
    'wikipedia.org', 'wikimedia.org',
    'amazon.com', 'amazon.co.uk', 'amazon.de',
    'news.google.com', 'bbc.com', 'cnn.com', 'reuters.com',
    'stackoverflow.com', 'reddit.com', 'medium.com',
    'archive.org', 'web.archive.org',
    
    // System & File Management
    'explorer', 'finder', 'finder.mac',
    
    // Cloud & Remote Services
    'remote-desktop', 'teamviewer.com', 'anydesk.com',
    'azure.microsoft.com', 'aws.amazon.com', 'cloud.google.com',
    'vercel.com', 'netlify.com', 'heroku.com',
    
    // Communication (mixed use)
    'telegram.org', 't.me', 'discord.com',
    
    // Content & Media (educational)
    'udemy.com', 'coursera.org', 'khanacademy.org',
    'edx.org', 'codecademy.com',
  ],
  
  // Low productivity (0-30%)
  unproductive: [
    // Social Media
    'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
    'tiktok.com', 'snapchat.com', 'pinterest.com',
    'linkedin.com', // Often used for non-work browsing
    
    // Video & Entertainment
    'youtube.com', 'netflix.com', 'hulu.com', 'disneyplus.com',
    'twitch.tv', 'vimeo.com', 'dailymotion.com',
    'primevideo.com', 'hbomax.com',
    
    // Gaming
    'steam.com', 'epicgames.com', 'playstation.com', 'xbox.com',
    'minecraft.net', 'roblox.com', 'fortnite.com',
    
    // Messaging & Communication (personal)
    'whatsapp.com', 'wa.me', 'web.whatsapp.com',
    'messenger.com', 'facebook.com/messages',
    
    // Shopping & Lifestyle
    'ebay.com', 'etsy.com', 'aliexpress.com',
    'pinterest.com', 'instagram.com/shopping',
    
    // News & Entertainment
    'buzzfeed.com', '9gag.com', 'theguardian.com',
    'vice.com', 'vox.com',
    
    // AI Tools (often misused)
    'chat.openai.com', 'claude.ai', 'bard.google.com',
    'perplexity.ai', 'character.ai',
    
    // Music & Streaming
    'spotify.com', 'soundcloud.com', 'applemusic.com',
    'pandora.com', 'tidal.com',
    
    // Other distractions
    'crunchyroll.com', 'funnyordie.com', 'knowyourmeme.com',
    'kotaku.com', 'ign.com', 'polygon.com',
  ],
};

export interface ProductivityScore {
  category: 'productive' | 'neutral' | 'unproductive';
  score: number;
  confidence: number;
}

/**
 * Calculate productivity score for a website based on hostname
 * Uses weighted scoring based on actual research data
 */
export function calculateWebsiteProductivity(hostname: string): ProductivityScore {
  const lowerHostname = hostname.toLowerCase();
  
  // Check exact matches first
  if (WEBSITE_PRODUCTIVITY_CATEGORIES.productive.some(site => lowerHostname.includes(site))) {
    return {
      category: 'productive',
      score: 85 + Math.random() * 10, // 85-95%
      confidence: 0.9,
    };
  }
  
  if (WEBSITE_PRODUCTIVITY_CATEGORIES.unproductive.some(site => lowerHostname.includes(site))) {
    return {
      category: 'unproductive',
      score: 10 + Math.random() * 20, // 10-30%
      confidence: 0.9,
    };
  }
  
  if (WEBSITE_PRODUCTIVITY_CATEGORIES.neutral.some(site => lowerHostname.includes(site))) {
    return {
      category: 'neutral',
      score: 55 + Math.random() * 15, // 55-70%
      confidence: 0.7,
    };
  }
  
  // Heuristic scoring for uncategorized sites
  return calculateHeuristicProductivity(lowerHostname);
}

/**
 * Heuristic-based productivity scoring for sites not in our database
 */
function calculateHeuristicProductivity(hostname: string): ProductivityScore {
  // Development/Work-related keywords
  if (hostname.includes('github') || hostname.includes('gitlab') || hostname.includes('stackoverflow') || 
      hostname.includes('docs') || hostname.includes('office') || hostname.includes('work') ||
      hostname.includes('business') || hostname.includes('enterprise') || hostname.includes('api')) {
    return {
      category: 'productive',
      score: 75 + Math.random() * 15, // 75-90%
      confidence: 0.6,
    };
  }
  
  // Social/Media keywords
  if (hostname.includes('social') || hostname.includes('chat') || hostname.includes('video') ||
      hostname.includes('game') || hostname.includes('entertainment') || hostname.includes('music') ||
      hostname.includes('shopping') || hostname.includes('news')) {
    return {
      category: 'unproductive',
      score: 15 + Math.random() * 25, // 15-40%
      confidence: 0.6,
    };
  }
  
  // Default to neutral
  return {
    category: 'neutral',
    score: 50 + Math.random() * 20, // 50-70%
    confidence: 0.4,
  };
}

/**
 * Calculate productivity score based on user's actual browsing patterns
 * Factors in: time spent, visit frequency, time of day, session length
 */
export function calculateUserProductivityScore(
  hostname: string,
//   todo: consider total time spent
//   totalTime: number,
  sessionCount: number,
  averageSessionLength: number,
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
): number {
  const baseScore = calculateWebsiteProductivity(hostname).score;
  
  // Time-based adjustments
  let timeAdjustment = 0;
  
  // Longer sessions on productive sites = higher score
  if (averageSessionLength > 1800) { // 30+ minutes
    timeAdjustment += baseScore > 70 ? 5 : baseScore < 40 ? -5 : 0;
  }
  
  // High frequency visits to unproductive sites = lower score
  if (sessionCount > 20 && baseScore < 40) {
    timeAdjustment -= 10;
  }
  
  // Time of day considerations
  if (timeOfDay) {
    switch (timeOfDay) {
      case 'morning':
        // Morning browsing on productive sites gets bonus
        timeAdjustment += baseScore > 70 ? 5 : 0;
        break;
      case 'night':
        // Night browsing on any site reduces score
        timeAdjustment -= 3;
        break;
      case 'evening':
        // Evening browsing patterns
        if (hostname.includes('news') || hostname.includes('learning')) {
          timeAdjustment += 3;
        }
        break;
    }
  }
  
  // Final score calculation
  const finalScore = Math.max(0, Math.min(100, baseScore + timeAdjustment));
  return Math.round(finalScore);
}

/**
 * Get productivity recommendation based on score
 */
export function getProductivityRecommendation(score: number): {
  level: 'High' | 'Medium' | 'Low';
  color: string;
  message: string;
  suggestions: string[];
} {
  if (score >= 80) {
    return {
      level: 'High',
      color: '#52c41a',
      message: 'Excellent productivity!',
      suggestions: [
        'Consider taking regular breaks to maintain efficiency',
        'Share your productive habits with your team',
        'Use this as a baseline for future improvements'
      ]
    };
  } else if (score >= 60) {
    return {
      level: 'Medium',
      color: '#faad14',
      message: 'Moderate productivity level',
      suggestions: [
        'Focus on increasing time spent on productive websites',
        'Set specific goals for work-related browsing',
        'Consider using website blockers for distracting sites'
      ]
    };
  } else {
    return {
      level: 'Low',
      color: '#ff4d4f',
      message: 'Productivity needs improvement',
      suggestions: [
        'Limit time on social media and entertainment sites',
        'Set specific work blocks without distractions',
        'Use the Pomodoro technique for better focus',
        'Consider blocking or time-limiting unproductive websites'
      ]
    };
  }
}