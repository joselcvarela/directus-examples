<script setup lang="ts">
import { ref } from "vue";
import { useUpload } from "./composables/useUpload";
import help from "../README.md?raw";

const url = ref("http://localhost:8055");
const token = ref("");
const collection = ref("");
const uploading = ref(false);
const message = ref("");
const error = ref("");
const type = ref<"big-csv" | "multiple-json">("big-csv");
const sleepTime = ref(5000);

async function send(form: HTMLFormElement) {
  try {
    message.value = "Uploading ⏳";
    uploading.value = true;

    const upload = useUpload(
      url.value,
      sleepTime.value,
      collection.value,
      token.value
    );

    if (type.value === "big-csv") {
      const fileInput = form.elements.namedItem("file") as HTMLInputElement;
      if (!fileInput.files?.length) {
        return (message.value = "No file selected 🤷");
      }

      await upload.uploadBigCsv(fileInput.files[0]);
    } else if (type.value === "multiple-json") {
      const folderInput = form.elements.namedItem("folder") as HTMLInputElement;
      if (!folderInput.files?.length) {
        return (message.value = "No file selected 🤷");
      }

      await upload.uploadJsonFiles(folderInput.files);
    }

    message.value = "Done ✅";
  } catch (err) {
    error.value = JSON.stringify(err);
    message.value = "⚠️ Error!";
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="upload-file">
    <form @submit.prevent="send($refs.form as HTMLFormElement)" ref="form">
      <label>
        <span>type</span>
        <select v-model="type">
          <option>big-csv</option>
          <option>multiple-json</option>
        </select>
      </label>

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
        <span>wait time between uploads (ms)</span>
        <input
          type="number"
          name="sleep"
          placeholder="delay"
          min="1000"
          step="100"
          v-model="sleepTime"
        />
      </label>

      <label v-if="type === 'big-csv'">
        <span>csv file</span>
        <input type="file" name="file" />
      </label>

      <label v-else-if="type === 'multiple-json'">
        <span>json files</span>
        <input type="file" multiple name="folder" />
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
