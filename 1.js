// 程序入口（核心：全局自动组+每个分组包含自动选择/回退/负载均衡）
function main(config) {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount = typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 基础过滤配置（从自用版2.js迁移）
  const EX_INFO = "(?i)群|邀请|返利|循环|官网|客服|网站|网址"; // 杂项过滤
  const EX_RATE = "(?i)高倍率|限速|试用"; // 高倍率节点过滤
  const EX_ALL = `${EX_INFO}|${EX_RATE}`; // 组合过滤
  const groupBaseOption = {
    "interval": 300,
    "tolerance": 100,
    "url": "https://www.gstatic.com/generate_204",
    "lazy": false,
    "disable-udp": false
  };

  // 公共代理节点列表（从自用版2.js迁移）
  const baseProxies = [
    "节点选择", "香港节点", "台湾节点", "日本节点",
    "新加坡节点", "美国节点", "全部节点", "负载均衡",
    "自动选择", "自动回退", "DIRECT"
  ];
  const baseProxiesCN = [
    "DIRECT", "节点选择", "香港节点", "台湾节点",
    "全部节点", "负载均衡", "自动选择", "自动回退"
  ];

  // 工厂函数：生成社交/国际/大陆分组（从自用版2.js迁移并适配）
  function createGroups(groups) {
    return groups.map(groupArgs => {
      let [name, icon, type, proxiesOrExtra, extra] = groupArgs;

      // 参数修正逻辑
      if (typeof type !== 'string') {
        extra = proxiesOrExtra;
        proxiesOrExtra = type;
        type = 'select';
      }
      if (!type) type = 'select';

      let proxies;
      let extraOptions = extra || {};

      if (Array.isArray(proxiesOrExtra)) {
        proxies = proxiesOrExtra;
      } else if (typeof proxiesOrExtra === 'boolean') {
        proxies = proxiesOrExtra ? baseProxiesCN : baseProxies;
      } else if (proxiesOrExtra && typeof proxiesOrExtra === 'object') {
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
        ...extraOptions,
      };

      // 注入默认过滤
      if (!groupConfig["exclude-filter"]) {
        groupConfig["exclude-filter"] = EX_INFO;
      }

      return groupConfig;
    });
  }

  // 工厂函数：生成地区分组（包含自动选择/回退/负载均衡）
  function createRegionGroups({ name, icon, filter }) {
    const subNames = ["自动", "回退", "均衡"];
    const proxies = subNames.map(s => `${name}${s}`);
    const regionFilter = filter;
    
    return [
      // 1. 手动选择组
      {
        ...groupBaseOption,
        name: `${name}节点`,
        type: "select",
        proxies,
        filter: regionFilter,
        icon
      },
      // 2. 自动选择组（url-test）
      {
        ...groupBaseOption,
        name: `${name}自动`,
        type: "url-test",
        hidden: true,
        filter: regionFilter,
        "exclude-filter": EX_ALL,
        icon
      },
      // 3. 自动回退组（fallback）
      {
        ...groupBaseOption,
        name: `${name}回退`,
        type: "fallback",
        hidden: true,
        filter: regionFilter,
        "exclude-filter": EX_INFO,
        icon
      },
      // 4. 负载均衡组（load-balance）
      {
        ...groupBaseOption,
        name: `${name}均衡`,
        type: "load-balance",
        hidden: true,
        filter: regionFilter,
        "exclude-filter": EX_ALL,
        icon
      }
    ];
  }

  // 全局自动组：自动选择/回退/负载均衡
  const globalAutoGroups = [
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "interval": 120,
      "tolerance": 200,
      "include-all": true,
      "exclude-filter": EX_ALL,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
    },
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "include-all": true,
      "exclude-filter": EX_INFO,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg"
    },
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      "include-all": true,
      "exclude-filter": EX_ALL,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg"
    }
  ];

  // 应用分组：使用工厂函数生成，包含三类自动节点
  const appGroups = createGroups([
    ["谷歌服务", "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"]],
    
    ["YouTube", "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"]],
    
    ["Netflix", "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/netflix.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"]],
    
    ["电报消息", "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"]],
    
    ["AI", "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择"]],
    
    ["TikTok", "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/tiktok.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择"]],
    
    ["微软服务", "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "全局直连", "节点选择"]],
    
    ["苹果服务", "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"]],
    
    ["动画疯", "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/Bahamut.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择"]],
    
    ["哔哩哔哩港澳台", "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/bilibili.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "全局直连", "节点选择"]],
    
    ["Spotify", "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/spotify.svg", "select",
      ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"]]
  ]);

  // 地区分组：使用工厂函数生成带自动节点的地区组
  const regionGroups = [
    ...createRegionGroups({
      name: "美国",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/US.png",
      filter: "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\\b(US|United States|America)\\b)"
    }),
    ...createRegionGroups({
      name: "日本",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/JP.png",
      filter: "(?i)🇯🇵|日本|东京|(\\b(JP|Japan)\\b)"
    }),
    ...createRegionGroups({
      name: "香港",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/HK.png",
      filter: "(?i)🇭🇰|香港|(\\b(HK|Hong|HongKong)\\b)"
    }),
    ...createRegionGroups({
      name: "新加坡",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/SG.png",
      filter: "(?i)🇸🇬|新加坡|狮|(\\b(SG|Singapore)\\b)"
    }),
    ...createRegionGroups({
      name: "台湾",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/TW.png",
      filter: "(?i)🇨🇳|🇹🇼|台湾|(\\b(TW|Tai|Taiwan)\\b)"
    })
  ];

  // 基础功能分组
  const baseGroups = [
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "负载均衡", ...regionGroups.map(g => g.name)],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
    },
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
      "proxies": ["DIRECT", "节点选择", "自动选择", "自动回退", "负载均衡"],
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
      "proxies": ["自动选择", "自动回退", "负载均衡", "节点选择", "全局直连"],
      "include-all": true,
      "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
    }
  ];

  // 合并所有分组
  config["proxy-groups"] = [
    ...globalAutoGroups,
    ...appGroups,
    ...regionGroups,
    ...baseGroups
  ];

  // 从自用版2.js迁移DNS配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "respect-rules": true,
    "prefer-h3": false,
    "ipv6": true,
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": [
      "dns.alidns.com",
      "dns.google",
      "dns.adguard-dns.com",
      "dns.18bit.cn",
      "RULE-SET:Fakeip_Filter",
      "RULE-SET:CN",
      "RULE-SET:Private"
    ],
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "nameserver": [
      "quic://dns.adguard-dns.com",
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query",
      "https://9.9.9.9/dns-query"
    ],
    "proxy-server-nameserver": ["223.5.5.5", "119.29.29.29"],
    "direct-nameserver": ["223.5.5.5", "119.29.29.29"],
    "direct-nameserver-follow-policy": true,
    "nameserver-policy": {
      "geosite:cn": [
        "quic://dns.alidns.com",
        "https://doh.pub/dns-query",
        "quic://dns.18bit.cn"
      ]
    }
  };

  // 为所有节点启用UDP
  if (config["proxies"]) {
    config["proxies"].forEach(proxy => {
      proxy.udp = true;
    });
  }

  return config;
}
