// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query" // 腾讯DoH
];
// 国外DNS服务器
const foreignNameservers = [
  "https://208.67.222.222/dns-query", // OpenDNS
  "https://77.88.8.8/dns-query", // YandexDNS
  "https://1.1.1.1/dns-query", // CloudflareDNS
  "https://8.8.4.4/dns-query", // GoogleDNS  
];

// 排除规则配置（保持不变）
const EX_INFO = [
  "(?i)群|邀请|返利|循环|建议|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入",
  "剩余|(\\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\\b|\\d{4}-\\d{2}-\\d{2}|\\d+G)"
].join('|');
const EX_RATE = [
  "高倍|高倍率|倍率[2-9]",
  "x[2-9]\\.?\\d*",
  "\\([xX][2-9]\\.?\\d*\\)",
  "\\[[xX][2-9]\\.?\\d*\\]",
  "\\{[xX][2-9]\\.?\\d*\\}",
  "（[xX][2-9]\\.?\\d*）",
  "【[xX][2-9]\\.?\\d*】",
  "【[2-9]x】",
  "【\\d+[xX]】"
].join('|');
const EX_ALL = `${EX_INFO}|${EX_RATE}`;

// DNS配置（保持不变）
const dnsConfig = {
  "enable": true,
  "listen": "0.0.0.0:1053",
  "ipv6": false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "+.lan", "+.local",
    "+.msftconnecttest.com", "+.msftncsi.com",
    "localhost.ptlogin2.qq.com", "localhost.sec.qq.com",
    "+.in-addr.arpa", "+.ip6.arpa",
    "time.*.com", "time.*.gov", "pool.ntp.org",
    "localhost.work.weixin.qq.com"
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"],
  "nameserver": [...foreignNameservers],
  "proxy-server-nameserver": [...domesticNameservers],
  "direct-nameserver": [...domesticNameservers],
  "nameserver-policy": { "geosite:private,cn": domesticNameservers }
};

// 规则集通用配置+规则集配置（保持不变）
const ruleProviderCommon = {
  "type": "http", "format": "yaml", "interval": 86400
};
const ruleProviders = {
  "reject": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt", "path": "./ruleset/loyalsoldier/reject.yaml" },
  "icloud": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt", "path": "./ruleset/loyalsoldier/icloud.yaml" },
  "apple": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt", "path": "./ruleset/loyalsoldier/apple.yaml" },
  "google": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt", "path": "./ruleset/loyalsoldier/google.yaml" },
  "proxy": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt", "path": "./ruleset/loyalsoldier/proxy.yaml" },
  "direct": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt", "path": "./ruleset/loyalsoldier/direct.yaml" },
  "private": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt", "path": "./ruleset/loyalsoldier/private.yaml" },
  "gfw": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt", "path": "./ruleset/loyalsoldier/gfw.yaml" },
  "tld-not-cn": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt", "path": "./ruleset/loyalsoldier/tld-not-cn.yaml" },
  "telegramcidr": { ...ruleProviderCommon, "behavior": "ipcidr", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt", "path": "./ruleset/loyalsoldier/telegramcidr.yaml" },
  "cncidr": { ...ruleProviderCommon, "behavior": "ipcidr", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt", "path": "./ruleset/loyalsoldier/cncidr.yaml" },
  "lancidr": { ...ruleProviderCommon, "behavior": "ipcidr", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt", "path": "./ruleset/loyalsoldier/lancidr.yaml" },
  "applications": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt", "path": "./ruleset/loyalsoldier/applications.yaml" },
  "bahamut": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Bahamut.txt", "path": "./ruleset/xiaolin-007/bahamut.yaml" },
  "YouTube": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/YouTube.txt", "path": "./ruleset/xiaolin-007/YouTube.yaml" },
  "Netflix": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Netflix.txt", "path": "./ruleset/xiaolin-007/Netflix.yaml" },
  "Spotify": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Spotify.txt", "path": "./ruleset/xiaolin-007/Spotify.yaml" },
  "BilibiliHMT": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/BilibiliHMT.txt", "path": "./ruleset/xiaolin-007/BilibiliHMT.yaml" },
  "AI": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/AI.txt", "path": "./ruleset/xiaolin-007/AI.yaml" },
  "TikTok": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/TikTok.txt", "path": "./ruleset/xiaolin-007/TikTok.yaml" }
};

// 规则（保持不变）
const rules = [
  "DOMAIN-SUFFIX,googleapis.cn,节点选择",
  "DOMAIN-SUFFIX,gstatic.com,节点选择",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择",
  "DOMAIN-SUFFIX,github.io,节点选择",
  "DOMAIN,v2rayse.com,节点选择",
  "RULE-SET,applications,全局直连",
  "RULE-SET,private,全局直连",
  "RULE-SET,reject,广告过滤",
  "RULE-SET,icloud,微软服务",
  "RULE-SET,apple,苹果服务",
  "RULE-SET,YouTube,YouTube",
  "RULE-SET,Netflix,Netflix",
  "RULE-SET,bahamut,动画疯",
  "RULE-SET,Spotify,Spotify",
  "RULE-SET,BilibiliHMT,哔哩哔哩港澳台",
  "RULE-SET,AI,AI",
  "RULE-SET,TikTok,TikTok",
  "RULE-SET,google,谷歌服务",
  "RULE-SET,proxy,节点选择",
  "RULE-SET,gfw,节点选择",
  "RULE-SET,tld-not-cn,节点选择",
  "RULE-SET,direct,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "RULE-SET,cncidr,全局直连,no-resolve",
  "RULE-SET,telegramcidr,电报消息,no-resolve",
  "GEOSITE,CN,全局直连",
  "GEOIP,LAN,全局直连,no-resolve",
  "GEOIP,CN,全局直连,no-resolve",
  "MATCH,漏网之鱼"
];

// 代理组通用配置（保持不变）
const groupBaseOption = {
  "interval": 300,
  "timeout": 3000,
  "url": "https://www.google.com/generate_204",
  "lazy": true,
  "max-failed-times": 3,
  "hidden": false
};

// 程序入口（核心：全局自动组+每个分组包含自动选择/回退）
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount = typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 🌟 全局自动组：自动选择（url-test）和自动回退（fallback）
  const globalAutoGroups = [
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "interval": 120,
      "tolerance": 200,
      "include-all": true,
      "exclude-filter": EX_ALL, // 排除杂项+高倍率
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "include-all": true,
      "exclude-filter": EX_INFO, // 仅排除杂项
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    }
  ];

  // 🌟 主代理组：每个分组包含「自动选择+自动回退+其他选项」
  const mainProxyGroups = [
    // 基础选择组
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["自动选择", "自动回退"], // 包含全局自动组
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },

    // 应用分组：每个分组都包含自动选择和自动回退
    {
      ...groupBaseOption,
      "name": "谷歌服务",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
    },
    {
      ...groupBaseOption,
      "name": "YouTube",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
    },
    {
      ...groupBaseOption,
      "name": "Netflix",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/netflix.svg"
    },
    {
      ...groupBaseOption,
      "name": "电报消息",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
    },
    {
      ...groupBaseOption,
      "name": "AI",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg"
    },
    {
      ...groupBaseOption,
      "name": "TikTok",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/tiktok.svg"
    },
    {
      ...groupBaseOption,
      "name": "微软服务",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "全局直连", "节点选择"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },
    {
      ...groupBaseOption,
      "name": "动画疯",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/Bahamut.svg"
    },
    {
      ...groupBaseOption,
      "name": "哔哩哔哩港澳台",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "全局直连", "节点选择"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/bilibili.svg"
    },
    {
      ...groupBaseOption,
      "name": "Spotify",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/spotify.svg"
    },
    //地区分组
    {
      ...groupBaseOption,
      "name": "美国",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\\b(US|United States|America)\\b)",
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/US.png"
    },
    {
      ...groupBaseOption,
      "name": "日本",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "filter": "(?i)🇯🇵|日本|东京|(\\b(JP|Japan)\\b)",
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/JP.png"
    },
    {
      ...groupBaseOption,
      "name": "香港",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "filter": "(?i)🇭🇰|香港|(\\b(HK|Hong|HongKong)\\b)",
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/HK.png"
    },        
    {
      ...groupBaseOption,
      "name": "新加坡",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\\b(SG|Singapore)\\b)",
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/SG.png"
    },
    {
      ...groupBaseOption,
      "name": "台湾",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\\b(TW|Tai|Taiwan)\\b)",
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/TW.png"
    }, 
    // 其他基础组
    {
      ...groupBaseOption,
      "name": "广告过滤",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg"
    },
    {
      ...groupBaseOption,
      "name": "全局直连",
      "type": "select",
      "proxies": ["DIRECT", "节点选择", "自动选择", "自动回退"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg"
    },
    {
      ...groupBaseOption,
      "name": "全局拦截",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg"
    },
    {
      ...groupBaseOption,
      "name": "漏网之鱼",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    }
  ];

  // 合并全局自动组和主代理组
  config["proxy-groups"] = [...globalAutoGroups, ...mainProxyGroups];

  // 覆盖原配置（DNS、规则集、规则）
  config["dns"] = dnsConfig;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  // 为所有节点启用UDP
  if (config["proxies"]) {
    config["proxies"].forEach(proxy => {
      proxy.udp = true;
    });
  }

  return config;
}
