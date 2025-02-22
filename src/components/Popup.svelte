<script lang="ts">
  import { onMount } from "svelte";
  import Module from "./Module.svelte";

  let {
    titleText,
    text,
    displaying = $bindable(),
    onCancel = $bindable(),
    onSubmit = $bindable(),
    cancel = $bindable(),
    submit = $bindable()
  }: {
    titleText?: string;
    text: string;
    displaying: boolean;
    onCancel?: () => any;
    onSubmit?: () => any;
    cancel?: () => any;
    submit?: () => any;
  } = $props();

  async function cancelBtn() {
    onCancel && (await onCancel());
    displaying = false;
  }

  async function submitBtn() {
    onSubmit && (await onSubmit());
    displaying = false;
  }

  cancel = cancelBtn;
  submit = submitBtn;
</script>

<div class={"center" + (displaying ? " display" : "")}>
  <Module text={titleText || "confirm"}>
    <span>{text}</span>
    <div class="buttons">
      <button class="old submit" onclick={submitBtn}>&lt;acknowledge&gt;</button>
      <button class="old cancel" onclick={cancelBtn}>&lt;cancel&gt;</button>
    </div>
  </Module>
</div>

<style lang="scss">
  @use "/src/vars" as *;

  .center {
    max-width: 520px;
    visibility: hidden;
    opacity: 0%;
    translate: 0 -20px;
    transition: all $transition-duration;
  }

  .display {
    visibility: visible;
    opacity: 100%;
    translate: 0 0px;
  }

  .buttons {
    display: flex;
    flex-direction: row-reverse;
    gap: $padding;
  }
</style>
