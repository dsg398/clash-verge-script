// 国内DNS服务器
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query" // 腾讯DoH
];
// 国外DNS服务器
const foreignNameservers = [
  "https://208.67.222.222/dns-query", // OpenDNS
  "https://77.88.8.8/dns-query", //YandexDNS
  "https://1.1.1.1/dns-query", // CloudflareDNS
  "https://8.8.4.4/dns-query", // GoogleDNS  

];
// DNS配置（不变）
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
    "+.lan", "+.local", // 本地设备
    "+.msftconnecttest.com", "+.msftncsi.com", // Windows网络修复
    "localhost.ptlogin2.qq.com", "localhost.sec.qq.com", // QQ登录
    "+.in-addr.arpa", "+.ip6.arpa", // IP反向解析
    "time.*.com", "time.*.gov", "pool.ntp.org", // 时间同步
    "localhost.work.weixin.qq.com" // 微信登录
  ],
  "default-nameserver": ["223.5.5.5","1.2.4.8"],// 可修改为自己ISP的DNS
  "nameserver": [...foreignNameservers],
  "proxy-server-nameserver":[...domesticNameservers],
  "direct-nameserver":[...domesticNameservers],
  "nameserver-policy": { "geosite:private,cn": domesticNameservers }
};

// 规则集通用配置（不变）
const ruleProviderCommon = {
  "type": "http",
  "format": "yaml",
  "interval": 86400 // 每天更新规则
};

// 规则集配置（不变，含Twitter、Whatsapp）
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
  "TikTok": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/TikTok.txt", "path": "./ruleset/xiaolin-007/TikTok.yaml" },
  "Instagram": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/rule/Instagram.txt", "path": "./ruleset/dsg398/Instagram.yaml" },
  "Twitter": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/rule/Twitter.txt", "path": "./ruleset/xiaolin-007/Twitter.yaml" },
  "Whatsapp": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/rule/Whatsapp.txt", "path": "./ruleset/dsg398/Whatsapp.yaml" }
};

// 规则（不变，含Twitter、Whatsapp分流）
const rules = [
  // 自定义规则
  "DOMAIN-SUFFIX,googleapis.cn,节点选择", // Google服务
  "DOMAIN-SUFFIX,gstatic.com,节点选择", // Google静态资源
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择", // Google Play
  "DOMAIN-SUFFIX,github.io,节点选择", // Github Pages
  "DOMAIN,v2rayse.com,节点选择", // V2rayse工具
  // 规则集分流
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
  "RULE-SET,Instagram,Instagram",
  "RULE-SET,TikTok,TikTok",
  "RULE-SET,Twitter,Twitter",
  "RULE-SET,Whatsapp,Whatsapp",
  "RULE-SET,google,谷歌服务",
  "RULE-SET,proxy,节点选择",
  "RULE-SET,gfw,节点选择",
  "RULE-SET,tld-not-cn,节点选择",
  "RULE-SET,direct,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "RULE-SET,cncidr,全局直连,no-resolve",
  "RULE-SET,telegramcidr,电报消息,no-resolve",
  // 兜底规则
  "GEOSITE,CN,全局直连",
  "GEOIP,LAN,全局直连,no-resolve",
  "GEOIP,CN,全局直连,no-resolve",
  "MATCH,漏网之鱼"
];

// 代理组通用配置（不变）
const groupBaseOption = {
  "interval": 300, // 健康检查间隔（秒）
  "timeout": 3000, // 超时时间（毫秒）
  "url": "https://www.google.com/generate_204", // 延迟测试地址
  "lazy": true, // 懒加载（仅使用时触发检查）
  "max-failed-times": 3, // 最大失败次数（超过标记不可用）
  "hidden": false // 默认显示分组
};

// 地区分组配置：新增【低/高倍率筛选规则】
const regionGroups = [
  {
    name: "香港节点",
    regionFilter: "(?i)香港|hk|HK", // 地区筛选：匹配“香港”“hk”
    lowRateFilter: "^(?!.*(10x|20x|30x|高倍率|倍速)).*$", // 低倍率：排除高倍率关键词
    highRateFilter: "(?i)10x|20x|30x|高倍率|倍速", // 高倍率：包含高倍率关键词
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
  },
  {
    name: "美国节点",
    regionFilter: "(?i)美国|us|US|america",
    lowRateFilter: "^(?!.*(10x|20x|30x|高倍率|倍速)).*$",
    highRateFilter: "(?i)10x|20x|30x|高倍率|倍速",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
  },
  {
    name: "日本节点",
    regionFilter: "(?i)日本|jp|JP|japan",
    lowRateFilter: "^(?!.*(10x|20x|30x|高倍率|倍速)).*$",
    highRateFilter: "(?i)10x|20x|30x|高倍率|倍速",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
  },
  {
    name: "台湾节点",
    regionFilter: "(?i)台湾|tw|TW",
    lowRateFilter: "^(?!.*(10x|20x|30x|高倍率|倍速)).*$",
    highRateFilter: "(?i)10x|20x|30x|高倍率|倍速",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
  },
  {
    name: "新加坡节点",
    regionFilter: "(?i)新加坡|sg|SG|singapore",
    lowRateFilter: "^(?!.*(10x|20x|30x|高倍率|倍速)).*$",
    highRateFilter: "(?i)10x|20x|30x|高倍率|倍速",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
  }
];

// 程序入口
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount = typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖DNS配置（不变）
  config["dns"] = dnsConfig;

  // 关键修改：生成【分层地区分组】（低倍率子组 + 高倍率子组 + 主组）
  const regionGroupConfigs = [];
  regionGroups.forEach(region => {
    // 1. 低倍率子分组：筛选“目标地区+低倍率”节点，选延迟最低的
    const lowRateSubGroup = {
      ...groupBaseOption,
      "name": `${region.name}-低倍率`, // 子组名称（隐藏）
      "type": "url-test", // 延迟排序：选低延迟
      "interval": 120, // 缩短检测间隔（2分钟，更实时）
      "tolerance": 200, // 延迟容忍度（200ms内视为同等）
      "include-all": true,
      // 双重筛选：目标地区 + 低倍率
      "filter": new RegExp(`(${region.regionFilter}) && (${region.lowRateFilter})`),
      "hidden": true, // 隐藏子组，避免UI混乱
      "icon": region.icon
    };

    // 2. 高倍率子分组：筛选“目标地区+高倍率”节点，选延迟最低的
    const highRateSubGroup = {
      ...groupBaseOption,
      "name": `${region.name}-高倍率`, // 子组名称（隐藏）
      "type": "url-test", // 延迟排序：选低延迟
      "interval": 120,
      "tolerance": 200,
      "include-all": true,
      // 双重筛选：目标地区 + 高倍率
      "filter": new RegExp(`(${region.regionFilter}) && (${region.highRateFilter})`),
      "hidden": true, // 隐藏子组
      "icon": region.icon
    };

    // 3. 地区主分组：故障转移（fallback），优先低倍率子组
    const mainGroup = {
      ...groupBaseOption,
      "name": region.name, // 对外显示的主组名称
      "type": "fallback", // 优先级逻辑：先试低倍率，超时再试高倍率
      "interval": 300,
      "proxies": [lowRateSubGroup.name, highRateSubGroup.name], // 优先级：低倍率 > 高倍率
      "icon": region.icon
    };

    // 按顺序加入配置（子组在前，主组在后，确保主组能引用子组）
    regionGroupConfigs.push(lowRateSubGroup, highRateSubGroup, mainGroup);
  });

  // 覆盖代理组：地区分组保持在Spotify后
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["延迟选优", "故障转移", ...regionGroups.map(g => g.name)], // 引用地区主组
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
    {
      ...groupBaseOption,
      "name": "延迟选优",
      "type": "url-test",
      "interval": 120,
      "tolerance": 200,
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      "name": "故障转移",
      "type": "fallback",
      "include-all": true,
      "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    },
    // 原有服务分组（谷歌、YouTube等，不变）
    { ...groupBaseOption, "name": "谷歌服务", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg" },
    { ...groupBaseOption, "name": "YouTube", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg" },
    { ...groupBaseOption, "name": "Netflix", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/netflix.svg" },
    { ...groupBaseOption, "name": "电报消息", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg" },
    { ...groupBaseOption, "name": "AI", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg" },
    { ...groupBaseOption, "name": "TikTok", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/tiktok.svg" },
    { ...groupBaseOption, "name": "Instagram", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/instagram.svg" },
    { ...groupBaseOption, "name": "Twitter", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/twitter.png" },
    { ...groupBaseOption, "name": "Whatsapp", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Whatsapp.svg" },
    { ...groupBaseOption, "name": "微软服务", "type": "select", "proxies": ["全局直连", "节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg" },
    { ...groupBaseOption, "name": "苹果服务", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg" },
    { ...groupBaseOption, "name": "动画疯", "type": "select", "proxies": ["节点选择", ...regionGroups.filter(g => g.name.includes("台湾")).map(g => g.name)], "include-all": true, "filter": "(?i)台|tw|TW", "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/Bahamut.svg" },
    { ...groupBaseOption, "name": "哔哩哔哩港澳台", "type": "select", "proxies": ["全局直连", "节点选择", "延迟选优", ...regionGroups.filter(g => g.name.includes("香港") || g.name.includes("台湾")).map(g => g.name)], "include-all": true, "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$", "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/bilibili.svg" },
    { ...groupBaseOption, "name": "Spotify", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/spotify.svg" },
    // 插入地区分组（低倍率子组+高倍率子组+主组）
    ...regionGroupConfigs,
    // 原有兜底分组（广告过滤、全局直连等，不变）
    { ...groupBaseOption, "name": "广告过滤", "type": "select", "proxies": ["REJECT", "DIRECT"], "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg" },
    { ...groupBaseOption, "name": "全局直连", "type": "select", "proxies": ["DIRECT", "节点选择", "延迟选优", ...regionGroups.map(g => g.name)], "include-all": true, "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg" },
    { ...groupBaseOption, "name": "全局拦截", "type": "select", "proxies": ["REJECT", "DIRECT"], "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg" },
    { ...groupBaseOption, "name": "漏网之鱼", "type": "select", "proxies": ["节点选择", "延迟选优", ...regionGroups.map(g => g.name), "全局直连"], "include-all": true, "filter": "^(?!.*(官网|套餐|流量|异常|剩余)).*$", "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg" }
  ];

  // 覆盖规则集和规则（不变）
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  
  // 为所有节点启用UDP（保证视频、语音功能）
  if (config["proxies"]) {
    config["proxies"].forEach(proxy => { proxy.udp = true; });
  }
  
  return config;
}
