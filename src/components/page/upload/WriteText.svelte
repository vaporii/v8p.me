<script lang="ts">
  let {
    text = $bindable(""),
    disabled = false
  }: {
    text: string;
    disabled: boolean;
  } = $props();
</script>

<textarea name="text" id="text" placeholder="write some text..." {disabled} bind:value={text}
></textarea>

<style lang="scss">
  @use "../../../vars" as *;

  textarea {
    width: 100%;
    height: 100px;
    margin-bottom: $padding;
  }
</style>
