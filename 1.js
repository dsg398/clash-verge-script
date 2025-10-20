// 国内DNS服务器（阿里、腾讯DoH，适配国内网络）
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query"    // 腾讯DoH
];

// 国外DNS服务器（OpenDNS、Yandex等，适配国际网络）
const foreignNameservers = [
  "https://208.67.222.222/dns-query", // OpenDNS
  "https://77.88.8.8/dns-query",      // YandexDNS
  "https://1.1.1.1/dns-query",        // CloudflareDNS
  "https://8.8.4.4/dns-query"         // GoogleDNS  
];

// 排除规则配置（过滤无效/低质节点）
// EX_INFO：过滤含杂项信息的节点（如官网、返利、流量提示等）
const EX_INFO = [
  "(?i)群|邀请|返利|循环|建议|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入",
  "剩余|(\\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\\b|\\d{4}-\\d{2}-\\d{2}|\\d+G)"
].join('|');

// EX_RATE：过滤高倍率/限速节点（如x2、高倍率等）
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

// EX_ALL：合并所有排除规则（用于自动选择/负载均衡分组）
const EX_ALL = `${EX_INFO}|${EX_RATE}`;

// DNS配置（防泄露+智能分流）
const dnsConfig = {
  "enable": true,                  // 启用DNS
  "listen": "0.0.0.0:1053",        // DNS监听地址
  "ipv6": false,                   // 关闭IPv6（避免部分网络兼容问题）
  "prefer-h3": false,              // 不优先HTTP/3
  "respect-rules": true,           // 尊重分流规则
  "use-system-hosts": false,       // 不使用系统hosts
  "cache-algorithm": "arc",        // 缓存算法（ARC）
  "enhanced-mode": "fake-ip",      // 启用Fake-IP模式（防DNS泄露）
  "fake-ip-range": "198.18.0.1/16",// Fake-IP网段
  "fake-ip-filter": [              // Fake-IP例外（避免本地服务异常）
    "+.lan", "+.local",
    "+.msftconnecttest.com", "+.msftncsi.com",
    "localhost.ptlogin2.qq.com", "localhost.sec.qq.com",
    "+.in-addr.arpa", "+.ip6.arpa",
    "time.*.com", "time.*.gov", "pool.ntp.org",
    "localhost.work.weixin.qq.com"
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"], // 默认DNS（国内）
  "nameserver": [...foreignNameservers],          // 国际网络DNS
  "proxy-server-nameserver": [...domesticNameservers], // 代理流量DNS（国内）
  "direct-nameserver": [...domesticNameservers],  // 直连流量DNS（国内）
  "nameserver-policy": { "geosite:private,cn": domesticNameservers } // 国内域名用国内DNS
};

// 规则集通用配置（HTTP拉取+每日更新）
const ruleProviderCommon = {
  "type": "http",    // 拉取方式
  "format": "yaml",  // 规则格式
  "interval": 86400  // 更新间隔（86400秒=1天）
};

// 规则集配置（分流核心：按服务/域名分类）
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

// 分流规则（按优先级排序：特殊域名→规则集→地理信息→默认匹配）
const rules = [
  // 特殊域名：强制走节点选择（避免国内节点无法访问）
  "DOMAIN-SUFFIX,googleapis.cn,节点选择",
  "DOMAIN-SUFFIX,gstatic.com,节点选择",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择",
  "DOMAIN-SUFFIX,github.io,节点选择",
  "DOMAIN,v2rayse.com,节点选择",
  
  // 应用/私有域名：直连（减少延迟）
  "RULE-SET,applications,全局直连",
  "RULE-SET,private,全局直连",
  
  // 广告/垃圾域名：拦截
  "RULE-SET,reject,广告过滤",
  
  // 苹果服务：走苹果服务分组（修正原“微软服务”错误）
  "RULE-SET,icloud,苹果服务",
  "RULE-SET,apple,苹果服务",
  
  // 视频/社交平台：专属分组
  "RULE-SET,YouTube,YouTube",
  "RULE-SET,Netflix,Netflix",
  "RULE-SET,bahamut,动画疯",    // 新增“动画疯”分组匹配
  "RULE-SET,Spotify,Spotify",
  "RULE-SET,BilibiliHMT,哔哩哔哩港澳台",
  "RULE-SET,AI,AI",
  "RULE-SET,TikTok,TikTok",
  
  // 谷歌/国际代理域名：走对应分组
  "RULE-SET,google,谷歌服务",
  "RULE-SET,proxy,节点选择",
  "RULE-SET,gfw,节点选择",
  "RULE-SET,tld-not-cn,节点选择",
  
  // 直连域名/局域网/国内IP：直连
  "RULE-SET,direct,全局直连",
  "RULE-SET,lancidr,全局直连,no-resolve",
  "RULE-SET,cncidr,全局直连,no-resolve",
  
  // 电报IP段：走电报消息分组
  "RULE-SET,telegramcidr,电报消息,no-resolve",
  
  // 国内域名/IP：直连
  "GEOSITE,CN,全局直连",
  "GEOIP,LAN,全局直连,no-resolve",
  "GEOIP,CN,全局直连,no-resolve",
  
  // 默认匹配：走漏网之鱼分组
  "MATCH,漏网之鱼"
];

// 代理组通用配置（基础测试/超时参数）
const groupBaseOption = {
  "interval": 300,         // 节点延迟测试间隔（300秒=5分钟）
  "timeout": 3000,         // 测试超时时间（3000毫秒=3秒）
  "url": "https://www.google.com/generate_204", // 测试URL（谷歌204响应）
  "lazy": true,            // 懒加载（仅使用时测试节点）
  "max-failed-times": 3,   // 最大失败次数（超过则标记节点不可用）
  "hidden": false          // 默认显示分组（子分组会手动设为hidden）
};

// 工厂函数：生成地区分组（含手动选择/自动选择/回退/负载均衡）
function createRegionGroups({ name, icon, filter }) {
  const subNames = ["自动", "回退", "均衡"]; // 子分组后缀
  const proxies = subNames.map(s => `${name}${s}`); // 子分组名称列表
  const regionFilter = filter; // 地区节点过滤正则（如匹配“香港”节点）
  
  return [
    // 1. 手动选择分组（用户手动切换地区节点）
    {
      ...groupBaseOption,
      name: `${name}节点`,
      type: "select",
      proxies,
      filter: regionFilter,
      icon
    },
    // 2. 自动选择分组（按延迟选最优节点，过滤无效节点）
    {
      ...groupBaseOption,
      name: `${name}自动`,
      type: "url-test",
      hidden: true,          // 隐藏（通过“地区节点”分组间接调用）
      filter: regionFilter,
      "exclude-filter": EX_ALL, // 过滤杂项+高倍率节点
      proxies: [],           // 空列表+include-all=true：自动匹配所有符合filter的节点
      "include-all": true,
      icon
    },
    // 3. 自动回退分组（节点故障时自动切换，仅过滤杂项）
    {
      ...groupBaseOption,
      name: `${name}回退`,
      type: "fallback",
      hidden: true,
      filter: regionFilter,
      "exclude-filter": EX_INFO, // 仅过滤杂项节点（保留高倍率应急）
      proxies: [],
      "include-all": true,
      icon
    },
    // 4. 负载均衡分组（多节点分摊流量，过滤无效节点）
    {
      ...groupBaseOption,
      name: `${name}均衡`,
      type: "load-balance",
      hidden: true,
      filter: regionFilter,
      "exclude-filter": EX_ALL,
      proxies: [],
      "include-all": true,
      "strategy": "round-robin", // 负载均衡策略（轮询）
      icon
    }
  ];
}

// 工厂函数：生成应用分组（适配不同服务的专属分组）
function createAppGroups(groups) {
  return groups.map(groupArgs => {
    let [name, icon, type, proxiesOrExtra, extra] = groupArgs;
    
    // 参数修正：处理可选参数的默认值
    if (typeof type !== 'string') {
      extra = proxiesOrExtra;
      proxiesOrExtra = type;
      type = 'select'; // 默认分组类型为“手动选择”
    }
    if (!type) type = 'select';
    
    let proxies;
    let extraOptions = extra || {};
    
    // 基础国际节点列表（默认应用分组的可选节点）
    const baseProxies = [
      "节点选择", "香港节点", "台湾节点", "日本节点", 
      "新加坡节点", "美国节点", "全部节点", 
      "负载均衡", "自动选择", "自动回退", "DIRECT"
    ];
    
    // 处理proxies参数（支持数组/布尔值/对象）
    if (Array.isArray(proxiesOrExtra)) {
      proxies = proxiesOrExtra; // 自定义节点列表
    } else if (typeof proxiesOrExtra === 'boolean') {
      // 布尔值：true=国内应用（优先直连），false=国际应用（默认列表）
      proxies = proxiesOrExtra 
        ? ["DIRECT", "节点选择", "香港节点", "台湾节点"] 
        : baseProxies;
    } else if (proxiesOrExtra && typeof proxiesOrExtra === 'object') {
      proxies = proxiesOrExtra.proxies; // 对象形式传参
      extraOptions = { ...proxiesOrExtra, ...extraOptions };
      delete extraOptions.proxies; // 移除proxies，避免重复
    }
    
    // 生成应用分组配置
    const groupConfig = {
      ...groupBaseOption,
      name,
      type,
      icon,
      proxies: proxies || baseProxies,
      ...extraOptions,
    };
    
    // 注入默认排除规则（未指定时过滤杂项节点）
    if (!groupConfig["exclude-filter"]) {
      groupConfig["exclude-filter"] = EX_INFO;
    }
    
    return groupConfig;
  });
}

// 程序入口：整合所有配置，生成最终Clash配置
function main(config) {
  // 校验：确保配置中有代理节点或代理提供商
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount = typeof config?.["proxy-providers"] === "object" 
    ? Object.keys(config["proxy-providers"]).length 
    : 0;
  
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理节点或代理提供商，请检查上游订阅！");
  }

  // 1. 生成地区分组（香港/台湾/日本/新加坡/美国）
  const regionGroups = [
    ...createRegionGroups({
      name: "香港",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/HK.png",
      filter: "(?i)🇭🇰|香港|(\\b(HK|Hong|HongKong)\\b)"
    }),
    ...createRegionGroups({
      name: "台湾",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/TW.png",
      filter: "(?i)🇹🇼|台湾|(\\b(TW|Tai|Taiwan)\\b)"
    }),
    ...createRegionGroups({
      name: "日本",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/JP.png",
      filter: "(?i)🇯🇵|日本|东京|(\\b(JP|Japan)\\b)"
    }),
    ...createRegionGroups({
      name: "新加坡",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/SG.png",
      filter: "(?i)🇸🇬|新加坡|(\\b(SG|Singapore)\\b)"
    }),
    ...createRegionGroups({
      name: "美国",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/US.png",
      filter: "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\\b(US|United States|America)\\b)"
    }),
  ];

  // 2. 生成应用分组（AI/社交/媒体等）- 已删除重复的“YouTube”
  const appGroups = createAppGroups([
    ["AI", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/AI.png"],
    ["Telegram", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/telegram.png"],
    ["Instagram", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Instagram.png"],
    ["TikTok", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/tiktok.png"],
    ["Twitter", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/X.png"],
    ["WhatsApp", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Whatsapp.png"],
    ["国际媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"],
    ["国内媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/CN_Media.png", true], // 国内应用：优先直连
  ]);

  // 3. 生成全局自动分组（跨地区自动选择/回退/负载均衡）
  const globalAutoGroups = [
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "interval": 120,        // 缩短测试间隔（120秒=2分钟，更快响应节点变化）
      "tolerance": 200,       // 延迟容忍值（200毫秒，避免频繁切换）
      "proxies": [
        "香港自动", "台湾自动", "日本自动", 
        "新加坡自动", "美国自动"
      ],
      "exclude-filter": EX_ALL,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "proxies": [
        "香港回退", "台湾回退", "日本回退", 
        "新加坡回退", "美国回退"
      ],
      "exclude-filter": EX_INFO,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    },
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      "proxies": [
        "香港均衡", "台湾均衡", "日本均衡", 
        "新加坡均衡", "美国均衡"
      ],
      "exclude-filter": EX_ALL,
      "strategy": "round-robin",
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg"
    },
    {
      ...groupBaseOption,
      "name": "全部节点",
      "type": "select",
      "proxies": [
        "自动选择", "自动回退", "负载均衡", 
        "香港节点", "台湾节点", "日本节点",
        "新加坡节点", "美国节点", "DIRECT"
      ],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    }
  ];

  // 4. 生成主代理分组（核心分流入口，新增“微软服务”“动画疯”）
  const mainProxyGroups = [
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "负载均衡", ...regionGroups.filter(g => g.type === "select").map(g => g.name)],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
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
      "name": "苹果服务",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },
    {
      ...groupBaseOption,
      "name": "微软服务", // 新增微软服务分组（避免后续引用缺失）
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
      ...groupBaseOption,
      "name": "动画疯", // 新增动画疯分组（匹配bahamut规则集）
      "type": "select",
      "proxies": ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/bahamut.png"
    },
    {
      ...groupBaseOption,
      "name": "全局直连",
      "type": "select",
      "proxies": ["DIRECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/home.svg"
    },
    {
      ...groupBaseOption,
      "name": "广告过滤",
      "type": "select",
      "proxies": ["REJECT"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/filter.svg"
    },
    {
      ...groupBaseOption,
      "name": "漏网之鱼",
      "type": "select",
      "proxies": ["节点选择", "自动选择", "自动回退", "全局直连"],
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/question.svg"
    }
  ];

  // 5. 合并所有分组（关键：先加载被引用的分组，避免“未找到”错误）
  const allGroups = [
    ...regionGroups,          // 1. 先加载地区分组（被全局自动组引用）
    ...globalAutoGroups,      // 2. 再加载全局自动组（被主分组引用）
    ...appGroups,             // 3. 然后加载应用分组
    ...mainProxyGroups.filter(g => !["节点选择", "YouTube", "Netflix"].includes(g.name)) // 4. 最后加载主分组（过滤重复项）
  ];

  // 6. 更新最终配置（注入DNS、规则、分组等）
  config["dns"] = dnsConfig;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  config["proxy-groups"] = allGroups;
  
  // 7. 添加通用客户端配置（端口、LAN访问等）
  config["mixed-port"] = "7890";       // 混合端口（支持HTTP/SOCKS）
  config["tcp-concurrent"] = true;     // 启用TCP并发（提升速度）
  config["allow-lan"] = true;          // 允许LAN访问（局域网共享代理）
  config["ipv6"] = true;               // 启用IPv6（适配部分网络）
  config["log-level"] = "info";        // 日志级别（info：基础日志，不冗余）
  
  return config;
}
