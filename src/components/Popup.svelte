<script lang="ts">
  import Module from "./Module.svelte";

  let {
    titleText,
    text,
    displaying = $bindable(),
    onCancel,
    onSubmit,
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

  async function keyPress(e: KeyboardEvent) {
    if (e.key === "Escape") {
      cancel && (await cancel());
    }
  }
</script>

<svelte:window onkeyup={keyPress} />

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
