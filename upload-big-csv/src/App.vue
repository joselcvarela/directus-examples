<script setup lang="ts">
import { ref } from "vue";
import help from "../README.md?raw";

const url = ref("http://localhost:8055");
const token = ref("");
const collection = ref("");
const uploading = ref(false);
const message = ref("");

async function send(form: HTMLFormElement) {
  const fileInput = form.elements.namedItem("file") as HTMLInputElement;
  if (!fileInput.files?.length) return (message.value = "No file selected 🤷");

  message.value = "Uploading ⏳";
  uploading.value = true;

  const file = fileInput.files[0];
  const stream = file.stream();
  const decoder = new TextDecoder("utf-8");

  let first = false;
  let headers = "";
  let remainder = "";

  for await (const chunk of stream) {
    let text = remainder + decoder.decode(chunk, { stream: true });

    if (!first) {
      first = true;
      const indexOfBr = text.search(/\r\n|\n/);
      headers = text.substring(0, indexOfBr + 1);
      text = text.substring(indexOfBr + 1);
    }

    const indexOfBr = text.search(/\r\n|\n.*?$/);

    remainder = text.substring(indexOfBr);
    text = text.substring(0, indexOfBr + 1);

    const mockFile = new Blob([headers, text], { type: "text/csv" });

    const formData = new FormData();
    formData.append("file", mockFile);

    await fetch(
      new URL(`/utils/import/${collection.value.trim()}`, url.value.trim()),
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token.value.trim()}`,
        },
      }
    );

    await sleep();
  }

  uploading.value = true;

  message.value = "Done ✅";
}

function sleep(timeout = 1000) {
  return new Promise((res) => setTimeout(res, timeout));
}
</script>

<template>
  <div class="upload-file">
    <form @submit.prevent="send($refs.form as HTMLFormElement)" ref="form">
      <label>
        <span>url</span>
        <input type="text" name="url" placeholder="url" v-model="url" />
      </label>
      <label>
        <span>token</span>
        <input
          type="password"
          name="token"
          placeholder="token"
          autocomplete="new-password"
          v-model="token"
        />
      </label>
      <label>
        <span>collection</span>
        <input
          type="text"
          name="collection"
          placeholder="collection"
          v-model="collection"
        />
      </label>
      <label>
        <span>csv</span>
        <input type="file" name="file" />
      </label>
      <button :disabled="uploading">Send</button>
      <p v-if="message">{{ message }}</p>
    </form>

    <details>
      <summary>help</summary>
      <div v-html="help"></div>
    </details>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
}

.upload-file {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  height: 100%;

  form {
    width: 80%;
    display: flex;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  details {
    width: 80%;
  }
}
</style>
