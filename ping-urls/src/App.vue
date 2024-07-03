<script setup lang="ts">
import { ref } from "vue";

const pattern = ref(
  localStorage.getItem("pattern") || "https://${url}/server/ping"
);
const list = ref(localStorage.getItem("list") || "");
const error = ref("");
const abort_on_offline = ref(false);
const result = ref<{ url: string; state: "online" | "offline" }[]>([]);

async function start() {
  result.value = [];
  if (!list.value?.length) error.value = "List is empty 🙅";

  localStorage.setItem("pattern", pattern.value);
  localStorage.setItem("list", list.value);

  const listArray = list.value.split(/\s+/g);
  const urls: string[] = [];

  for (const item of listArray) {
    const raw_url = pattern.value.replace(/(\$\{\s*url\s*\})/g, item);

    if (!URL.canParse(raw_url)) {
      error.value = `"${raw_url}" is not a valid URL`;
      return;
    }

    urls.push(raw_url.toString());
  }

  for (let i = 0; i < urls.length; i += 10) {
    const chunk = urls.slice(i, i + 10);
    const pings = await Promise.all(
      chunk.map(async (url) => {
        const request = await fetch(url, { method: "GET" }).catch(() => null);
        const online = request
          ? request.status >= 200 && request.status < 400
          : false;

        return {
          url,
          status: request?.status || 0,
          state: online ? "online" : "offline",
        } as const;
      })
    );

    if (abort_on_offline.value === true) {
      const offline = pings.find((p) => p.state === "offline");
      if (offline) {
        result.value = [];
        error.value = `URL "${offline.url}" is offline with status ${offline.status}`;
        return;
      }
    }

    result.value = result.value.concat(pings);
  }
}
</script>

<template>
  <label>
    <p>pattern</p>
    <input type="text" v-model="pattern" />
  </label>
  <label>
    <p>list</p>
    <textarea v-model="list"></textarea>
  </label>
  <label>
    <p>abort on offline</p>
    <input type="checkbox" v-model="abort_on_offline" />
  </label>
  <button @click="start()">start</button>
  <div v-if="result.length">
    <h1>result</h1>
    <div class="scroll">
      <table>
        <tr>
          <th>url</th>
          <th>state</th>
        </tr>
        <tr v-for="item in result">
          <td>{{ item.url }}</td>
          <td :class="item.state">{{ item.state }}</td>
        </tr>
      </table>
    </div>
  </div>
  <div v-else-if="error">
    <h2>{{ error }}</h2>
  </div>
</template>

<style>
html,
body {
  height: 100%;
}

body {
  display: flex;
  justify-content: center;
  align-items: center;
}

#app {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 60%;
}

input {
  width: 100%;
}

.scroll {
  max-height: 25rem;
}

.online {
  color: springgreen;
}

.offline {
  color: orangered;
}
</style>
