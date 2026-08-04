import type { ToolManifest } from '../types'

type Manifest = Omit<ToolManifest, 'component'>

/** 网络工具元数据 */
export const networkToolManifests: Manifest[] = [
  { id: 'ip-formatter', name: 'IP Formatter', nameZh: 'IP 地址格式化', icon: 'mdi:ip', category: ['network'], keywords: ['ip', 'ipv4', 'ipv6', 'address', '地址', '格式化'], description: 'IPv4/IPv6 地址格式化与转换', advance: { recommend: { type: 'ipv4', priority: 4 } } },
  { id: 'cidr-calculator', name: 'CIDR Calculator', nameZh: 'CIDR 计算器', icon: 'mdi:calculator-network', category: ['network'], keywords: ['cidr', 'subnet', 'mask', '子网', '掩码', '计算'], description: 'CIDR 子网计算器' },
  { id: 'port-cheatsheet', name: 'Ports Cheatsheet', nameZh: '端口速查表', icon: 'mdi:ethernet', category: ['network'], keywords: ['port', 'ports', 'common', '端口', '速查'], description: '常用网络端口号速查表' },
  { id: 'user-agent-parser', name: 'User Agent Parser', nameZh: 'User-Agent 解析', icon: 'mdi:account-details', category: ['network'], keywords: ['user', 'agent', 'ua', 'browser', '解析'], description: '解析 User-Agent 字符串' },
  { id: 'url-parser', name: 'URL Parser', nameZh: 'URL 解析器', icon: 'mdi:link-variant', category: ['network'], keywords: ['url', 'uri', 'parse', '解析'], description: '解析 URL 各组成部分', advance: { recommend: { type: 'url', priority: 3 } } }
]
