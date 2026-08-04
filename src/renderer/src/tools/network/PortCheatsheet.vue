<template>
  <h-single-layout>
    <div class="port-cheatsheet">
      <h-input v-model="search" placeholder="搜索端口或服务名..." />
      <div class="port-cheatsheet__list">
        <div
          v-for="port in filteredPorts"
          :key="port.port"
          class="port-cheatsheet__item"
          :class="{ 'port-cheatsheet__item--tcp': port.tcp }"
          @click="copy(port.port)"
        >
          <span class="port-cheatsheet__num">{{ port.port }}</span>
          <div class="port-cheatsheet__info">
            <span class="port-cheatsheet__name">{{ port.name }}</span>
            <span class="port-cheatsheet__desc">{{ port.desc }}</span>
          </div>
          <span class="port-cheatsheet__proto">{{ port.proto }}</span>
        </div>
      </div>
    </div>
  </h-single-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')

const ports = [
  { port: '20', name: 'FTP-DATA', desc: '文件传输（数据）', proto: 'TCP' },
  { port: '21', name: 'FTP', desc: '文件传输（控制）', proto: 'TCP' },
  { port: '22', name: 'SSH', desc: '安全 Shell', proto: 'TCP' },
  { port: '23', name: 'Telnet', desc: '远程登录', proto: 'TCP' },
  { port: '25', name: 'SMTP', desc: '简单邮件传输', proto: 'TCP' },
  { port: '53', name: 'DNS', desc: '域名系统', proto: 'TCP/UDP' },
  { port: '80', name: 'HTTP', desc: '超文本传输', proto: 'TCP' },
  { port: '110', name: 'POP3', desc: '邮局协议 3', proto: 'TCP' },
  { port: '123', name: 'NTP', desc: '网络时间协议', proto: 'UDP' },
  { port: '143', name: 'IMAP', desc: '互联网消息访问', proto: 'TCP' },
  { port: '161', name: 'SNMP', desc: '简单网络管理', proto: 'UDP' },
  { port: '194', name: 'IRC', desc: '互联网中继聊天', proto: 'TCP' },
  { port: '443', name: 'HTTPS', desc: '安全 HTTP', proto: 'TCP' },
  { port: '445', name: 'SMB', desc: 'Samba / 共享', proto: 'TCP' },
  { port: '465', name: 'SMTPS', desc: '安全 SMTP', proto: 'TCP' },
  { port: '587', name: 'SMTP Submission', desc: '邮件提交', proto: 'TCP' },
  { port: '636', name: 'LDAPS', desc: '安全 LDAP', proto: 'TCP' },
  { port: '873', name: 'Rsync', desc: '远程同步', proto: 'TCP' },
  { port: '993', name: 'IMAPS', desc: '安全 IMAP', proto: 'TCP' },
  { port: '995', name: 'POP3S', desc: '安全 POP3', proto: 'TCP' },
  { port: '1433', name: 'MSSQL', desc: 'Microsoft SQL Server', proto: 'TCP' },
  { port: '1521', name: 'Oracle', desc: 'Oracle 数据库', proto: 'TCP' },
  { port: '2049', name: 'NFS', desc: '网络文件系统', proto: 'TCP/UDP' },
  { port: '3306', name: 'MySQL', desc: 'MySQL 数据库', proto: 'TCP' },
  { port: '3389', name: 'RDP', desc: '远程桌面', proto: 'TCP' },
  { port: '5432', name: 'PostgreSQL', desc: 'PostgreSQL 数据库', proto: 'TCP' },
  { port: '5900', name: 'VNC', desc: '虚拟网络计算', proto: 'TCP' },
  { port: '6379', name: 'Redis', desc: 'Redis 缓存', proto: 'TCP' },
  { port: '8080', name: 'HTTP Alt', desc: 'HTTP 备用端口', proto: 'TCP' },
  { port: '8443', name: 'HTTPS Alt', desc: 'HTTPS 备用端口', proto: 'TCP' },
  { port: '9200', name: 'Elasticsearch', desc: 'Elasticsearch', proto: 'TCP' },
  { port: '27017', name: 'MongoDB', desc: 'MongoDB 数据库', proto: 'TCP' }
]

const filteredPorts = computed(() => {
  if (!search.value.trim()) return ports
  const q = search.value.toLowerCase()
  return ports.filter((p) => p.port.includes(q) || p.name.toLowerCase().includes(q) || p.desc.includes(q))
})

function copy(text: string): void {
  window.$he3?.copyText(text)
  window.$he3?.message.success(`已复制端口: ${text}`)
}
</script>

<style scoped lang="less">
.port-cheatsheet {
  display: flex; flex-direction: column; gap: 12px;
  input { width: 100%; }

  &__list {
    display: flex; flex-direction: column; gap: 4px;
    max-height: 500px; overflow-y: auto;
  }

  &__item {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 12px; border: 1px solid var(--border-color);
    border-radius: var(--radius-sm); background: var(--bg-surface);
    cursor: pointer; transition: all var(--transition-fast);
    &:hover { border-color: var(--color-primary); }
  }

  &__num {
    font-family: monospace; font-size: 14px; font-weight: 700;
    color: var(--color-primary); min-width: 60px;
  }

  &__info {
    flex: 1; display: flex; flex-direction: column; gap: 2px;
  }

  &__name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  &__desc { font-size: 11px; color: var(--text-secondary); }
  &__proto { font-size: 10px; color: var(--text-tertiary); padding: 2px 6px; border: 1px solid var(--border-color); border-radius: 8px; }
}
</style>
