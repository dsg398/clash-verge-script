// 规则集通用配置
const ruleProviderCommon = {
  "interval": 86400,
  "proxy": "DIRECT",
  "type": "http",
  "format": "mrs",
};
// 1. 排除所有杂项/管理/通知信息（例如：官网、到期、流量剩余）
const EX_INFO = [
  "(?i)群|邀请|返利|循环|建议|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入",
  "可用|剩余|(\\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\\b|\\d{4}-\\d{2}-\\d{2}|\\d+G)"
].join('|');
// 2. 排除所有高倍率标识
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
// 3. 组合最终的排除字符串
const EX_ALL = `${EX_INFO}|${EX_RATE}`;
// 策略组通用配置 (移除所有默认过滤，让工厂函数负责)
const groupBaseOption = {
  "interval": 300,
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "tolerance": 60,
  "timeout": 5000,
  "max-failed-times": 5,
  "include-all": true,
  "filter": ""  // 确保 filter 为空
};
// 程序入口
const main = (config) => {
  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? (typeof config["proxy-providers"] === 'object' && config["proxy-providers"] !== null ? Object.keys(config["proxy-providers"]) : []).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }
  // 覆盖通用配置
  config["mixed-port"] = "7890";
  config["tcp-concurrent"] = true;
  config["allow-lan"] = true;
  config["ipv6"] = true;
  config["log-level"] = "info";
  config["unified-delay"] = "true";
  config["find-process-mode"] = "strict";
  config["global-client-fingerprint"] = "chrome";
  // 国内DNS服务器
  const domesticNameservers = [
    "quic://223.5.5.5",    // 阿里 DoQ（IP）
    "quic://114.114.114.114",  // 114 DNS（DoQ）
    "https://119.29.29.29/dns-query",  //腾讯 DoH
    "https://182.140.225.38/dns-query"  // 18bit（DoH）
  ];
  // 国外DNS服务器
  const foreignNameservers = [
    "quic://176.103.130.130", // AdGuard DNS（quic）
    "https://8.8.8.8/dns-query", //Google DNS（DoH）
    "https://1.1.1.1/dns-query",  // Cloudflare DNS（DoH）
    "https://9.9.9.9/dns-query" // Quad9 DNS（DoH）
  ];
  // 覆盖 dns 配置
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
      "RULE-SET:Private"],
    "default-nameserver": ["223.5.5.5", "1.2.4.8"],
    "nameserver": [...foreignNameservers],
    "proxy-server-nameserver": [...domesticNameservers],
    "direct-nameserver": [...domesticNameservers],
    "direct-nameserver-follow-policy": false,
    "nameserver-policy": {
      "geosite:cn": [...domesticNameservers]
    }
  };
  // 覆盖 geodata 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
    "geosite": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
    "mmdb": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
    "asn": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb"
  };
  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "parse-pure-ip": true,
    "sniff": {
      "TLS": {
        "ports": ["443", "8443"]
      },
      "HTTP": {
        "ports": ["80", "8080-8880"],
        "override-destination": true
      },
      "QUIC": {
        "ports": ["443", "8443"]
      }
    },
    "force-domain": ["+.v2ex.com"],
    "skip-domain": ["Mijia.Cloud.com"],
    "skip-src-address": ["192.168.0.3/32"],
    "skip-dst-address": ["192.168.0.3/32"]
  };
  // 覆盖 tun 配置
  config["tun"] = {
    "enable": true,
    "stack": "mixed",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": [
      "any:53",
      "tcp://any:53"
    ],
    "device": "utun0",
    "mtu": 1500,
    "strict-route": true,
    "gso": true,
    "gso-max-size": 65536,
    "udp-timeout": 300,
    "endpoint-independent-nat": false
  };
  // ========== 公共代理节点列表 ==========
  // 国际节点（包含新增社交分组的默认路由节点）
  const baseProxies = [
    "节点选择", "香港节点",
    "台湾节点",
    "日本节点",
    "新加坡节点",
    "美国节点",
    "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT",
  ];
  // 中国大陆节点
  const baseProxiesCN = [
    "节点选择", "DIRECT",
    "香港节点",
    "台湾节点",
    "全部节点", "负载均衡", "自动选择", "自动回退"
  ];
  // ========== 工厂函数：生成社交/国际/大陆分组 ==========
  function createGroups(groups) {
    return groups.map(groupArgs => {
      // 先进行一次参数“挪位”修正
      let [name, icon, type, proxiesOrExtra, extra] = groupArgs;
      // 参数修正逻辑
      if (typeof type !== 'string') {
        extra = proxiesOrExtra;
        proxiesOrExtra = type;
        type = 'select';
      }
      if (!type) {
        type = 'select';
      }
      let proxies;
      let extraOptions = extra || {};
      if (Array.isArray(proxiesOrExtra)) {
        proxies = proxiesOrExtra;
      } else if (typeof proxiesOrExtra === 'boolean') {
        // cnAppGroups 使用此逻辑
        proxies = proxiesOrExtra ? baseProxiesCN : baseProxies;
      } else if (proxiesOrExtra && typeof proxiesOrExtra === 'object') {
        proxies = proxiesOrExtra.proxies;
        extraOptions = { ...proxiesOrExtra, ...extraOptions };
        delete extraOptions.proxies;
      }
      // 1. 构造初始配置对象
      const groupConfig = {
        ...groupBaseOption,
        name,
        type,
        icon,
        proxies: proxies || baseProxies,
        ...extraOptions,
      };
      // 2. 注入 exclude-filter（排除杂项节点）
      if (!groupConfig["exclude-filter"]) {
        groupConfig["exclude-filter"] = EX_INFO;
      }
      // 最终返回修改后的配置对象
      return groupConfig;
    });
  }
  // ========== 工厂函数：生成地区分组（四种类型） ==========
  function createRegionGroups({ name, icon, filter }) {
    const subNames = ["自动", "回退", "均衡"];
    const proxies = subNames.map(s => `${name}${s}`);
    const regionFilter = filter;
    // 自动选择/负载均衡 排除所有 (EX_INFO | EX_RATE)
    const excludeForAutoGroups = EX_ALL; 
    // 自动回退 仅排除杂项 (EX_INFO)
    const excludeForFallback = EX_INFO; 
    return [
      // 1. SELECT 组 (手动选择) - 只做地区过滤
      {
        ...groupBaseOption,
        name: `${name}节点`,
        type: "select",
        proxies,
        filter: regionFilter,
        icon
      },
      // 2. URL-TEST 组 (自动选择) - 排除所有 (EX_ALL)
      {
        ...groupBaseOption,
        name: `${name}自动`,
        type: "url-test",
        hidden: true,
        filter: regionFilter, 
        "exclude-filter": excludeForAutoGroups,
        icon
      },
      // 3. FALLBACK 组 (自动回退) - 仅排除杂项 (EX_INFO)
      {
        ...groupBaseOption,
        name: `${name}回退`,
        type: "fallback",
        hidden: true,
        filter: regionFilter,
        "exclude-filter": excludeForFallback,
        icon
      },
      // 4. LOAD-BALANCE 组 (负载均衡) - 排除所有 (EX_ALL)
      {
        ...groupBaseOption,
        name: `${name}均衡`,
        type: "load-balance",
        hidden: true,
        filter: regionFilter,
        "exclude-filter": excludeForAutoGroups,
        icon
      }
    ];
  }
  // ========== 定义所有分组 ==========
  // 1️⃣ 国际分组（新增 Instagram、TikTok、Twitter、WhatsApp 分组）
  const socialGroups = createGroups([
    ["AI", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/AI.png"],
    ["Telegram", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/telegram.png"],
    // 移除 GitHub 分组：["GitHub", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/GitHub.png"],
    ["YouTube", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Youtube.png"],
    // 新增：Instagram 分组（图标+默认路由）
    ["Instagram", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Instagram.png"],
    // 新增：TikTok 分组（图标+默认路由）
    ["TikTok", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/tiktok.png"],
    // 新增：Twitter 分组（图标+默认路由）
    ["Twitter", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/X.png"],
    // 新增：WhatsApp 分组（图标+默认路由）
    ["WhatsApp", "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Whatsapp.png"],
    ["国际媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"],
  ]);
  // 2️⃣ 中国大陆 APP 分组
  const cnAppGroups = createGroups([
    ["国内媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/CN_Media.png", true],
  ]);
  // 3️⃣ 地区分组
  const regionGroups = [
    ...createRegionGroups({
      name: "香港",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/HK.png",
      filter: "(?i)🇭🇰|香港|(\\b(HK|Hong|HongKong)\\b)"
    }),
    ...createRegionGroups({
      name: "台湾",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/TW.png",
      filter: "(?i)🇨🇳|🇹🇼|台湾|(\\b(TW|Tai|Taiwan)\\b)"
    }),
    ...createRegionGroups({
      name: "日本",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/JP.png",
      filter: "(?i)🇯🇵|日本|东京|(\\b(JP|Japan)\\b)"
    }),
    ...createRegionGroups({
      name: "新加坡",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/SG.png",
      filter: "(?i)🇸🇬|新加坡|狮|(\\b(SG|Singapore)\\b)"
    }),
    ...createRegionGroups({
      name: "美国",
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/US.png",
      filter: "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\\b(US|United States|America)\\b)"
    }),
  ];
  const manualGroups = [
    {
      ...groupBaseOption,
      name: "Final",
      type: "select",
      proxies: ["节点选择", "DIRECT"],
      icon: "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Final.png"
    },
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["自动选择", "自动回退", "全部节点", "负载均衡", "DIRECT", "香港节点", "香港自动", "香港回退", "香港均衡", "台湾节点", "台湾自动", "台湾回退", "台湾均衡", "日本节点", "日本自动", "日本回退", "日本均衡", "新加坡节点", "新加坡自动", "新加坡回退", "新加坡均衡", "美国节点", "美国自动", "美国回退", "美国均衡"],
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Rocket.png"
    },
    {
      ...groupBaseOption,
      "name": "全部节点",
      "proxies": ["自动选择", "负载均衡", "自动回退", "DIRECT"],
      "type": "select",
      "include-all": true,
      "filter": "",
      "exclude-filter": EX_INFO,
      "icon": "https://fastly.jsdelivr.net/gh/dsg398/clash@main/icon/Airport.png"
    },
    // 自动选择组
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "",
      "exclude-filter": EX_ALL,
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    // 自动回退组
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "",
      "exclude-filter": EX_INFO,
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    // 负载均衡组
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "",
      "exclude-filter": EX_ALL,
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    }
  ];
  // ========== 覆写 config["proxy-groups"] ==========
  config["proxy-groups"] = [
    ...manualGroups,
    ...socialGroups,
    ...cnAppGroups,
    ...regionGroups,
  ];
  // 覆盖规则集（新增 Instagram、TikTok、Twitter、WhatsApp 的域名/IP 规则）- 移除 GitHub 规则集
  config["rule-providers"] = {
    "115": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/115/115_OCD_Domain.mrs",
      "path": "./ruleset/115_Domain.mrs"
    },
    "CN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/direct.mrs",
      "path": "./ruleset/CN_Domain.mrs"
    },
    "Private": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs",
      "path": "./ruleset/Private_Domain.mrs"
    },
    "Fakeip_Filter": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/fakeip-filter.mrs",
      "path": "./ruleset/Fakeip_Filter_Domain.mrs"
    },
    "ChinaMedia": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_Domain.mrs",
      "path": "./ruleset/ChinaMedia_Domain.mrs"
    },
    "ChinaMedia-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_IP.mrs",
      "path": "./ruleset/ChinaMedia_IP.mrs"
    },
    "NetEase": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NetEase/NetEase_OCD_Domain.mrs",
      "path": "./ruleset/NetEase_Domain.mrs"
    },
    "Alibaba": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://jsd.onmicrosoft.cn/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Alibaba/Alibaba_OCD_Domain.mrs",
      "path": "./ruleset/alibaba_Domain.mrs"
    },
    "Alibaba-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://jsd.onmicrosoft.cn/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Alibaba/Alibaba_OCD_IP.mrs",
      "path": "./ruleset/Alibaba_IP.mrs"
    },
    "NetEase-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NetEase/NetEase_OCD_IP.mrs",
      "path": "./ruleset/NetEase_IP.mrs"
    },
    "YouTube": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTube/YouTube_OCD_Domain.mrs",
      "path": "./ruleset/YouTube_Domain.mrs"
    },
    "YouTube-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTube/YouTube_OCD_IP.mrs",
      "path": "./ruleset/YouTube_IP.mrs"
    },
    "OpenAI": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_Domain.mrs",
      "path": "./ruleset/OpenAI_Domain.mrs"
    },
    "OpenAI-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_IP.mrs",
      "path": "./ruleset/OpenAI_IP.mrs"
    },
    // 移除 GitHub 域名规则集："GitHub": { ... }
    // 移除 GitHub IP 规则集："GitHub-ip": { ... }
    // 新增：Instagram 域名规则集
    "Instagram": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Instagram/Instagram_OCD_Domain.mrs",
      "path": "./ruleset/Instagram_Domain.mrs"
    },
    // 新增：Instagram IP 规则集
    "Instagram-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Instagram/Instagram_OCD_IP.mrs",
      "path": "./ruleset/Instagram_IP.mrs"
    },
    // 新增：TikTok 域名规则集
    "TikTok": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/TikTok/TikTok_OCD_Domain.mrs",
      "path": "./ruleset/TikTok_Domain.mrs"
    },
    // 新增：TikTok IP 规则集
    "TikTok-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/TikTok/TikTok_OCD_IP.mrs",
      "path": "./ruleset/TikTok_IP.mrs"
    },
    // 新增：Twitter 域名规则集
    "Twitter": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Twitter/Twitter_OCD_Domain.mrs",
      "path": "./ruleset/Twitter_Domain.mrs"
    },
    // 新增：Twitter IP 规则集
    "Twitter-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Twitter/Twitter_OCD_IP.mrs",
      "path": "./ruleset/Twitter_IP.mrs"
    },
    // 新增：WhatsApp 域名规则集
    "WhatsApp": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/WhatsApp/WhatsApp_OCD_Domain.mrs",
      "path": "./ruleset/WhatsApp_Domain.mrs"
    },
    // 新增：WhatsApp IP 规则集
    "WhatsApp-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/WhatsApp/WhatsApp_OCD_IP.mrs",
      "path": "./ruleset/WhatsApp_IP.mrs"
    },
    "awavenue": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
      "path": "./ruleset/awavenue.mrs"
    },
    "gaode": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GaoDe/GaoDe_OCD_Domain.mrs",
      "path": "./ruleset/GaoDe_Domain.mrs"
    },
    "Baidu": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Baidu/Baidu_OCD_Domain.mrs",
      "path": "./ruleset/Baidu_Domain.mrs"
    },
    "ByteDance": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ByteDance/ByteDance_OCD_Domain.mrs",
      "path": "./ruleset/ByteDance_Domain.mrs"
    },
    "ByteDance-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ByteDance/ByteDance_OCD_IP.mrs",
      "path": "./ruleset/ByteDance_IP.mrs"
    },
    "Claude": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Claude/Claude_OCD_Domain.mrs",
      "path": "./ruleset/Claude_Domain.mrs"
    },
    "Copilot": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_Domain.mrs",
      "path": "./ruleset/Copilot_Domain.mrs"
    },
    "Copilot-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_IP.mrs",
      "path": "./ruleset/Copilot_IP.mrs"
    },
    "DingTalk": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/DingTalk/DingTalk_OCD_Domain.mrs",
      "path": "./ruleset/DingTalk_Domain.mrs"
    },
    "DouYin": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/DouYin/DouYin_OCD_Domain.mrs",
      "path": "./ruleset/DouYin_Domain.mrs"
    },
    "Gemini": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Gemini/Gemini_OCD_Domain.mrs",
      "path": "./ruleset/Gemini_Domain.mrs"
    },
    "Tencent": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Tencent/Tencent_OCD_Domain.mrs",
      "path": "./ruleset/Tencent_Domain.mrs"
    },
    "Tencent-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Tencent/Tencent_OCD_IP.mrs",
      "path": "./ruleset/Tencent_IP.mrs"
    },
     "Alibaba": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://jsd.onmicrosoft.cn/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Alibaba/Alibaba_OCD_Domain.mrs",
      "path": "./ruleset/alibaba_Domain.mrs"
    },
    "Alibaba-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://jsd.onmicrosoft.cn/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Alibaba/Alibaba_OCD_IP.mrs",
      "path": "./ruleset/Alibaba_IP.mrs"
    },
    "GlobalMedia": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_Domain.mrs",
      "path": "./ruleset/Media_Domain.mrs"
    },
    "GlobalMedia-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_IP.mrs",
      "path": "./ruleset/Media_IP.mrs"
    },
    "BlockHttpDNS": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_Domain.mrs",
      "path": "./ruleset/Category_httpdns_Domain.mrs"
    },
    "BlockHttpDNS-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_IP.mrs",
      "path": "./ruleset/Category_httpdns_IP.mrs"
    },
    "Private-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs",
      "path": "./ruleset/Private_IP.mrs"
    },
    "Telegram": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs",
      "path": "./ruleset/Telegram_Domain.mrs"
    },
    "Telegram-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs",
      "path": "./ruleset/Telegram_IP.mrs"
    },
    "CN-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/cncidr.mrs",
      "path": "./ruleset/CN_IP.mrs"
    },
    "WeChat": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/WeChat/WeChat_Domain.mrs",
      "path": "./ruleset/WeChat_Domain.mrs"
    },
    "STUN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/STUN/STUN_Domain.mrs",
      "path": "./ruleset/STUN_Domain.mrs"
    },
  };
  // 覆盖规则
  config["rules"] = [
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-REJECT",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-LAN",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-DIRECT",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-DOMAIN",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-IP",
    "MATCH,Final"
  ];
  // 覆盖子规则（新增四个分组的流量匹配逻辑）- 移除 GitHub 流量匹配规则
  config["sub-rules"] = {
    "SUB-REJECT": [
      "RULE-SET,BlockHttpDNS,REJECT-DROP",
      "RULE-SET,awavenue,REJECT-DROP",
      "RULE-SET,BlockHttpDNS-ip,REJECT-DROP,no-resolve",
      "DOMAIN-KEYWORD,httpdns,REJECT-DROP",
      "RULE-SET,STUN,REJECT-DROP",
      "DST-PORT,3478,REJECT-DROP",
      "AND,(NETWORK,TCP),(DST-PORT,5349),REJECT-DROP",
      "AND,(NETWORK,UDP),(DST-PORT,5350),REJECT-DROP",
      "AND,(NETWORK,UDP),(DST-PORT,5351),REJECT-DROP",
      "AND,(NETWORK,UDP),(DST-PORT,19302),REJECT-DROP",
      "DOMAIN-KEYWORD,stun,REJECT-DROP"
    ],
    "SUB-LAN": [
      "RULE-SET,Private,DIRECT",
      "RULE-SET,Private-ip,DIRECT,no-resolve"
    ],
    "SUB-DIRECT": [
      "RULE-SET,Private,DIRECT",
      "RULE-SET,Private-ip,DIRECT,no-resolve",
      "RULE-SET,ByteDance,DIRECT",
      "RULE-SET,Tencent,DIRECT",
      "RULE-SET,CN,DIRECT",
      "RULE-SET,Alibaba,DIRECT",
      "RULE-SET,Alibaba-ip,DIRECT",
      "RULE-SET,gaode,DIRECT",
      "RULE-SET,DouYin,DIRECT",
      "RULE-SET,Baidu,DIRECT",
      "RULE-SET,Alibaba,DIRECT",
      "RULE-SET,Alibaba-ip,DIRECT",
      "RULE-SET,DingTalk,DIRECT",
      "OR,((RULE-SET,115),(DOMAIN-SUFFIX,115vod.com)),DIRECT",
      "RULE-SET,WeChat,DIRECT",
      "RULE-SET,NetEase,DIRECT",
      "RULE-SET,NetEase-ip,DIRECT,no-resolve",
      "RULE-SET,ByteDance-ip,DIRECT,no-resolve",
      "RULE-SET,Tencent-ip,DIRECT,no-resolve",
      "RULE-SET,CN-ip,DIRECT",
      "RULE-SET,Fakeip_Filter,DIRECT"
    ],
    "SUB-DOMAIN": [
      "OR,((RULE-SET,Telegram),(DOMAIN-KEYWORD,nicegram)),Telegram",
      // 移除 GitHub 流量匹配规则："OR,((RULE-SET,GitHub),(DOMAIN-KEYWORD,github)),GitHub",
      "OR,((RULE-SET,YouTube),(DOMAIN-KEYWORD,youtube)),YouTube",
      // 新增：Instagram 流量匹配（规则集+域名关键词）
      "OR,((RULE-SET,Instagram),(DOMAIN-KEYWORD,instagram),(DOMAIN-KEYWORD,instagr.am)),Instagram",
      // 新增：TikTok 流量匹配（规则集+域名关键词）
      "OR,((RULE-SET,TikTok),(DOMAIN-KEYWORD,tiktok),(DOMAIN-KEYWORD,ttcdn)),TikTok",
      // 新增：Twitter 流量匹配（规则集+域名关键词）
      "OR,((RULE-SET,Twitter),(DOMAIN-KEYWORD,twitter),(DOMAIN-KEYWORD,x.com)),Twitter",
      // 新增：WhatsApp 流量匹配（规则集+域名关键词）
      "OR,((RULE-SET,WhatsApp),(DOMAIN-KEYWORD,whatsapp),(DOMAIN-KEYWORD,wa.me)),WhatsApp",
      "OR,((RULE-SET,Claude),(RULE-SET,OpenAI),(RULE-SET,Gemini),(AND,((RULE-SET,Copilot),(NOT,((DOMAIN,www.bing.com))))),(DOMAIN-KEYWORD,openai),(DOMAIN-KEYWORD,openaicom-api),(DOMAIN-KEYWORD,colab),(DOMAIN-KEYWORD,developerprofiles),(DOMAIN-KEYWORD,generativelanguage)),AI",
      "RULE-SET,GlobalMedia,国际媒体",
      "RULE-SET,ChinaMedia,国内媒体",
    ],
    "SUB-IP": [
      "RULE-SET,ChinaMedia-ip,国内媒体,no-resolve",
      "RULE-SET,Telegram-ip,Telegram,no-resolve",
      // 新增：Instagram IP 流量匹配
      "RULE-SET,Instagram-ip,Instagram,no-resolve",
      // 新增：TikTok IP 流量匹配
      "RULE-SET,TikTok-ip,TikTok,no-resolve",
      // 新增：Twitter IP 流量匹配
      "RULE-SET,Twitter-ip,Twitter,no-resolve",
      // 新增：WhatsApp IP 流量匹配
      "RULE-SET,WhatsApp-ip,WhatsApp,no-resolve",
      "RULE-SET,Copilot-ip,AI,no-resolve",
      "RULE-SET,OpenAI-ip,AI,no-resolve",
      "RULE-SET,YouTube-ip,YouTube,no-resolve",
      "RULE-SET,GlobalMedia-ip,国际媒体,no-resolve",
    ]
  };
  // 返回修改后的配置
  return config;
};
