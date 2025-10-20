// 国内DNS服务器（阿里、腾讯DoH，适配国内网络）
const domesticNameservers = [
  "https://223.5.5.5/dns-query", // 阿里DoH
  "https://doh.pub/dns-query"    // doh.pub（通用 DoH）
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
  "(?i)群|邀请|返利|循环|建议|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内",
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
  enable: true,
  listen: "0.0.0.0:1053",
  ipv6: false,
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
  nameserver: [...foreignNameservers],
  "proxy-server-nameserver": [...domesticNameservers],
  "direct-nameserver": [...domesticNameservers],
  "nameserver-policy": { "geosite:private,cn": domesticNameservers }
};

// 规则集通用配置（HTTP拉取+每日更新）
const ruleProviderCommon = {
  type: "http",
  format: "yaml",
  interval: 86400
};

// 规则集配置（分流核心：按服务/域名分类）
const ruleProviders = {
  reject: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt", path: "./ruleset/loyalsoldier/reject.yaml" },
  icloud: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt", path: "./ruleset/loyalsoldier/icloud.yaml" },
  apple: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt", path: "./ruleset/loyalsoldier/apple.yaml" },
  google: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt", path: "./ruleset/loyalsoldier/google.yaml" },
  proxy: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt", path: "./ruleset/loyalsoldier/proxy.yaml" },
  direct: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt", path: "./ruleset/loyalsoldier/direct.yaml" },
  private: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt", path: "./ruleset/loyalsoldier/private.yaml" },
  gfw: { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt", path: "./ruleset/loyalsoldier/gfw.yaml" },
  "tld-not-cn": { ...ruleProviderCommon, behavior: "domain", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt", path: "./ruleset/loyalsoldier/tld-not-cn.yaml" },
  telegramcidr: { ...ruleProviderCommon, behavior: "ipcidr", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt", path: "./ruleset/loyalsoldier/telegramcidr.yaml" },
  cncidr: { ...ruleProviderCommon, behavior: "ipcidr", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt", path: "./ruleset/loyalsoldier/cncidr.yaml" },
  lancidr: { ...ruleProviderCommon, behavior: "ipcidr", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt", path: "./ruleset/loyalsoldier/lancidr.yaml" },
  applications: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt", path: "./ruleset/loyalsoldier/applications.yaml" },
  bahamut: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Bahamut.txt", path: "./ruleset/xiaolin-007/bahamut.yaml" },
  YouTube: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/YouTube.txt", path: "./ruleset/xiaolin-007/YouTube.yaml" },
  Netflix: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Netflix.txt", path: "./ruleset/xiaolin-007/Netflix.yaml" },
  Spotify: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Spotify.txt", path: "./ruleset/xiaolin-007/Spotify.yaml" },
  BilibiliHMT: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/BilibiliHMT.txt", path: "./ruleset/xiaolin-007/BilibiliHMT.yaml" },
  AI: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/AI.txt", path: "./ruleset/xiaolin-007/AI.yaml" },
  TikTok: { ...ruleProviderCommon, behavior: "classical", url: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/TikTok.txt", path: "./ruleset/xiaolin-007/TikTok.yaml" }
};

// 分流规则（按优先级排序：特殊域名→规则集→地理信息→默认匹配）
const rules = [
  "DOMAIN-SUFFIX,googleapis.cn,节点选择",
  "DOMAIN-SUFFIX,gstatic.com,节点选择",
  "DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择",
  "DOMAIN-SUFFIX,github.io,节点选择",
  "DOMAIN,v2rayse.com,节点选择",
  "RULE-SET,applications,全局直连",
  "RULE-SET,private,全局直连",
  "RULE-SET,reject,广告过滤",
  "RULE-SET,icloud,苹果服务",
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

// 代理组通用配置（基础测试/超时参数）
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: "https://www.google.com/generate_204",
  lazy: true,
  "max-failed-times": 3,
  hidden: false
};

// 工厂函数：生成地区分组（含手动选择/自动选择/回退/负载均衡）
function createRegionGroups({ name, icon, filter }) {
  const subNames = ["自动", "回退", "均衡"];
  const proxies = subNames.map(s => `${name}${s}`);
  const regionFilter = filter;

  return [
    {
      ...groupBaseOption,
      name: `${name}节点`,
      type: "select",
      proxies,
      filter: regionFilter,
      icon
    },
    {
      ...groupBaseOption,
      name: `${name}自动`,
      type: "url-test",
      hidden: true,
      filter: regionFilter,
      "exclude-filter": EX_ALL,
      proxies: [],
      "include-all": true,
      icon
    },
    {
      ...groupBaseOption,
      name: `${name}回退`,
      type: "fallback",
      hidden: true,
      filter: regionFilter,
      "exclude-filter": EX_INFO,
      proxies: [],
      "include-all": true,
      icon
    },
    {
      ...groupBaseOption,
      name: `${name}均衡`,
      type: "load-balance",
      hidden: true,
      filter: regionFilter,
      "exclude-filter": EX_ALL,
      proxies: [],
      "include-all": true,
      strategy: "round-robin",
      icon
    }
  ];
}

// 工厂函数：生成应用分组（适配不同服务的专属分组）
function createAppGroups(groups) {
  return groups.map(groupArgs => {
    let [name, icon, type, proxiesOrExtra, extra] = groupArgs;

    if (typeof type !== "string") {
      extra = proxiesOrExtra;
      proxiesOrExtra = type;
      type = "select";
    }
    if (!type) type = "select";

    let proxies;
    let extraOptions = extra || {};

    const baseProxies = [
      "节点选择", "香港节点", "台湾节点", "日本节点",
      "新加坡节点", "美国节点", "全部节点",
      "负载均衡", "自动选择", "自动回退", "DIRECT"
    ];

    if (Array.isArray(proxiesOrExtra)) {
      proxies = proxiesOrExtra;
    } else if (typeof proxiesOrExtra === "boolean") {
      proxies = proxiesOrExtra
        ? ["DIRECT", "节点选择", "香港节点", "台湾节点"]
        : baseProxies;
    } else if (proxiesOrExtra && typeof proxiesOrExtra === "object") {
      proxies = proxiesOrExtra.proxies;
      extraOptions = { ...proxiesOrExtra, ...extraOptions };
      delete extraOptions.proxies;
    }

    const groupConfig = {
      ...groupBaseOption,
      name,
      type,
      icon,
      proxies: proxies || baseProxies,
      ...extraOptions
    };

    if (!groupConfig["exclude-filter"]) {
      groupConfig["exclude-filter"] = EX_INFO;
    }

    return groupConfig;
  });
}

// 程序入口：整合所有配置，生成最终Clash配置
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount = typeof config?.["proxy-providers"] === "object"
    ? Object.keys(config["proxy-providers"]).length
    : 0;

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理节点或代理提供商，请检查上游订阅！");
  }

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
    })
  ];

  const appGroups = createAppGroups([
    ["AI", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/AI.png"],
    ["Telegram", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/telegram.png"],
    ["Instagram", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Instagram.png"],
    ["TikTok", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/tiktok.png"],
    ["Twitter", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/X.png"],
    ["WhatsApp", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Whatsapp.png"],
    ["国际媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"],
    ["国内媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/CN_Media.png", true]
  ]);

  const globalAutoGroups = [
    {
      ...groupBaseOption,
      name: "自动选择",
      type: "url-test",
      interval: 120,
      tolerance: 200,
      proxies: ["香港自动", "台湾自动", "日本自动", "新加坡自动", "美国自动"],
      "exclude-filter": EX_ALL,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      name: "自动回退",
      type: "fallback",
      proxies: ["香港回退", "台湾回退", "日本回退", "新加坡回退", "美国回退"],
      "exclude-filter": EX_INFO,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    },
    {
      ...groupBaseOption,
      name: "负载均衡",
      type: "load-balance",
      proxies: ["香港均衡", "台湾均衡", "日本均衡", "新加坡均衡", "美国均衡"],
      "exclude-filter": EX_ALL,
      strategy: "round-robin",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg"
    },
    {
      ...groupBaseOption,
      name: "全部节点",
      type: "select",
      proxies: ["自动选择", "自动回退", "负载均衡", "香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "DIRECT"],
      icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    }
  ];

  const mainProxyGroups = [
    {
      ...groupBaseOption,
      name: "节点选择",
      type: "select",
      proxies: ["自动选择", "自动回退", "负载均衡", ...regionGroups.filter(g => g.type === "select").map(g => g.name)],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
    {
      ...groupBaseOption,
      name: "谷歌服务",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
    },
    {
      ...groupBaseOption,
      name: "YouTube",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
    },
    {
      ...groupBaseOption,
      name: "Netflix",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/netflix.svg"
    },
    {
      ...groupBaseOption,
      name: "电报消息",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
    },
    {
      ...groupBaseOption,
      name: "苹果服务",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
    },
    {
      ...groupBaseOption,
      name: "微软服务",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
    },
    {
      ...groupBaseOption,
      name: "动画疯",
      type: "select",
      proxies: ["自动选择", "自动回退", "节点选择", "全局直连"],
      "include-all": true,
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/bahamut.png"
    },
    {
      ...groupBaseOption,
      name: "全局直连",
      type: "select",
      proxies: ["DIRECT"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/home.svg"
    },
    {
      ...groupBaseOption,
      name: "广告过滤",
      type: "select",
      proxies: ["REJECT"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/filter.svg"
    },
    {
      ...groupBaseOption,
      name: "漏网之鱼",
      type: "select",
      proxies: ["节点选择", "自动选择", "自动回退", "全局直连"],
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/question.svg"
    }
  ];

  const allGroups = [
    ...regionGroups,
    ...globalAutoGroups,
    ...appGroups,
    ...mainProxyGroups
  ];

  config["dns"] = dnsConfig;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;
  config["proxy-groups"] = allGroups;

  config["mixed-port"] = "7890";
  config["tcp-concurrent"] = true;
  config["allow-lan"] = true;
  config["ipv6"] = true;
  config["log-level"] = "info";

  return config;
}

module.exports = { main };
