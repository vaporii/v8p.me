<script lang="ts">
  import { times } from "$lib/times";

  let {
    expiresIn = $bindable(0)
  }: {
    expiresIn: number;
  } = $props();

  let expirationDateUnit = $state(times.week);
  let expirationNumber = $state(1);

  $effect(() => {
    expiresIn = expirationDateUnit * expirationNumber;
  });
</script>

<label for="expiry" class="option-label">expiry date</label>
<div class="expiry-wrapper">
  <input
    type="number"
    name="expiry"
    id="expiry"
    bind:value={expirationNumber}
    disabled={expirationDateUnit === 0}
  />
  <select name="dates" id="dates" bind:value={expirationDateUnit}>
    <option value={times.minute}>minutes</option>
    <option value={times.hour}>hours</option>
    <option value={times.day}>days</option>
    <option value={times.week}>weeks</option>
    <option value={times.month}>months</option>
    <option value={times.year}>years</option>
    <option value={times.decade}>decades</option>
    <option value={times.century}>centuries</option>
    <option value={times.millennium}>millennia</option>
    <option value={0}>none</option>
  </select>
</div>

<style lang="scss">
  @use "../../../vars" as *;

  .expiry-wrapper {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr 40%;
    gap: $padding;
  }

  .option-label {
    display: flex;
    margin: auto 0;
  }
</style>
