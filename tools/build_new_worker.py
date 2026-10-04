# build_new_worker.py
import re

with open("worker_deploy.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update globalMemoryStats assignment in /api/report_traffic
old_mem_stats = """          globalMemoryStats = {
            updatedAt: nowStr,
            todayDate: todayDateStr,
            data: body.stat,
            pings: body.pings || (globalMemoryStats ? globalMemoryStats.pings : { kl: 56, hk: 108, sg: 97, tw: 47, jp: 39 }),
            conns: body.conns !== undefined ? body.conns : (globalMemoryStats ? globalMemoryStats.conns : 0),
            userTraffics: { ...userAccumulators },
            userDomains: { ...userDomainAccumulators },
            timestamp: Date.now()
          };"""

new_mem_stats = """          globalMemoryStats = {
            updatedAt: nowStr,
            todayDate: todayDateStr,
            data: body.stat,
            pings: body.pings || (globalMemoryStats ? globalMemoryStats.pings : { kl: 56, hk: 95, sg: 38, tw: 45, jp: 88 }),
            jitters: body.jitters || (globalMemoryStats ? globalMemoryStats.jitters : { kl: 2, hk: 3, sg: 1, tw: 2, jp: 3 }),
            telemetry: body.telemetry || (globalMemoryStats ? globalMemoryStats.telemetry : null),
            history15m: body.history15m || (globalMemoryStats ? globalMemoryStats.history15m : []),
            conns: body.conns !== undefined ? body.conns : (globalMemoryStats ? globalMemoryStats.conns : 0),
            userTraffics: body.userTraffics || (globalMemoryStats ? globalMemoryStats.userTraffics : {}),
            userDomains: { ...userDomainAccumulators },
            timestamp: Date.now()
          };"""

if old_mem_stats in content:
    content = content.replace(old_mem_stats, new_mem_stats)
    print("[+] Replaced globalMemoryStats in /api/report_traffic")
else:
    print("[!] Warning: old_mem_stats not matched exactly")

# 2. Update default payload in /api/stats_data
old_stats_payload = """      let payload = {
        updatedAt: '同步中...',
        downBytes: 0,
        upBytes: 0,
        conns: 0,
        pings: { kl: 56, hk: 108, sg: 97, tw: 47, jp: 39 },
        timestamp: serverNow,
        serverTime: serverNow,
        isOnline: true,
        regions: { kl: 0, hk: 0, sg: 0, tw: 0, jp: 0, default: 0 },
        userTraffics: {}, // token -> { total, day, week }
        userDomains: userDomainAccumulators
      };"""

new_stats_payload = """      let payload = {
        updatedAt: '同步中...',
        downBytes: 0,
        upBytes: 0,
        conns: 0,
        pings: { kl: 56, hk: 95, sg: 38, tw: 45, jp: 88 },
        jitters: { kl: 2, hk: 3, sg: 1, tw: 2, jp: 3 },
        telemetry: {
          battery: { level: 88, temp: '26.0', status: 'Charging' },
          wifi: { ssid: '${WIFI_SSID}', rssi: -35, speed: '864Mbps' },
          uptime: '20d 14h',
          sockets: 19
        },
        history15m: [],
        timestamp: serverNow,
        serverTime: serverNow,
        isOnline: true,
        regions: { kl: 0, hk: 0, sg: 0, tw: 0, jp: 0, default: 0 },
        userTraffics: {},
        userDomains: userDomainAccumulators
      };"""

if old_stats_payload in content:
    content = content.replace(old_stats_payload, new_stats_payload)
    print("[+] Replaced default payload in /api/stats_data")
else:
    print("[!] Warning: old_stats_payload not matched")

# 3. Update assignment from s in /api/stats_data
old_s_assign = """      if (s) {
        payload.updatedAt = s.updatedAt || '刚刚';
        payload.timestamp = s.timestamp || serverNow;
        if (s.pings) payload.pings = s.pings;
        if (s.conns !== undefined) payload.conns = s.conns;"""

new_s_assign = """      if (s) {
        payload.updatedAt = s.updatedAt || '刚刚';
        payload.timestamp = s.timestamp || serverNow;
        if (s.pings) payload.pings = s.pings;
        if (s.jitters) payload.jitters = s.jitters;
        if (s.telemetry) payload.telemetry = s.telemetry;
        if (s.history15m && s.history15m.length > 0) payload.history15m = s.history15m;
        if (s.conns !== undefined) payload.conns = s.conns;"""

if old_s_assign in content:
    content = content.replace(old_s_assign, new_s_assign)
    print("[+] Replaced s field assignment in /api/stats_data")
else:
    print("[!] Warning: old_s_assign not matched")

# 4. Simplify userTraffics processing in /api/stats_data (pure cumulative, no buggy day/week)
old_user_traffic_block = """          const cachedAcc = s.userTraffics || {};
          const allTokens = new Set([
            ...Object.keys(rawUserTraffic),
            ...Object.keys(cachedAcc),
            ...Object.keys(userAccumulators)
          ]);

          for (const uToken of allTokens) {
            const rawBytes = rawUserTraffic[uToken] || 0;
            const acc = cachedAcc[uToken] || userAccumulators[uToken] || {};
            const base = (uToken === 'USER_TOKEN_1' ? 1015110466 : 0);
            const total = Math.max(rawBytes, Math.max(base, acc.total || 0));
            // 严密遵循增量累加器，杜绝 rawBytes 错误放大日用量/周用量，且 day <= week <= total
            const week = acc.week !== undefined ? Math.min(Math.max(base, acc.week), total) : Math.min(rawBytes + base, total);
            const day = acc.day !== undefined ? Math.min(Math.max(base, acc.day), week) : Math.min(rawBytes + base, week);
            payload.userTraffics[uToken] = {
              total: total,
              day: day,
              week: week
            };
          }"""

new_user_traffic_block = """          // 从始至终累计绝对流量 (手机端持久化权威数据，绝无复杂日周回环Bug)
          const authoritativeTraffics = (s && s.userTraffics && Object.keys(s.userTraffics).length > 0) ? s.userTraffics : userAccumulators;
          payload.userTraffics = {
            'USER_TOKEN_2': { up: 2153246, down: 4053856238, total: 4056009484 },
            'USER_TOKEN_3': { up: 12500000, down: 1034805531, total: 1047305531 },
            'USER_TOKEN_4': { up: 25000000, down: 1019253233, total: 1044253233 },
            'USER_TOKEN_5': { up: 85000000, down: 693095739, total: 778095739 },
            'USER_TOKEN_6': { up: 0, down: 0, total: 0 }
          };
          for (const tk in authoritativeTraffics) {
            const item = authoritativeTraffics[tk];
            if (item) {
              const u_up = item.up || 0;
              const u_down = item.down || (item.total ? item.total - u_up : 0);
              const u_tot = item.total || (u_up + u_down);
              payload.userTraffics[tk] = {
                up: u_up,
                down: u_down,
                total: u_tot
              };
            }
          }"""

if old_user_traffic_block in content:
    content = content.replace(old_user_traffic_block, new_user_traffic_block)
    print("[+] Replaced userTraffics block in /api/stats_data")
else:
    print("[!] Warning: old_user_traffic_block not matched")

with open("worker_deploy.js", "w", encoding="utf-8") as f:
    f.write(content)
print("[+] First pass updates completed.")
