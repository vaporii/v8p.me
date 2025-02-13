<script lang="ts">
	import { formatSize } from '$lib';
	import Module from '../../components/Module.svelte';
	let { data } = $props();

	function convertDate(inputDate: number) {
		const date = new Date(inputDate);
		const day = new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
			.format(date)
			.toLowerCase();
		const time = new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true
		})
			.format(date)
			.toLowerCase();
		return { day, time };
	}

	const date = convertDate(data.timestamp);
</script>

<div class="center">
	<Module text="file">
		<div class="wrapper">
			<div>
				<div class="filename">{data.fileName}</div>
				<div class="info">{formatSize(data.fileSize)} • {data.fileType}</div>
			</div>
			<a href={data.alias + "/direct"} download={data.fileName} class="download-icon">
				<img src="/icons/download.svg" alt="download icon" srcset="" />
			</a>
		</div>
		<div class="separator"></div>
		<div class="date">
			uploaded <span class="strong">{date.day}</span> at <span class="strong">{date.time}</span>
		</div>
	</Module>
</div>

<style lang="scss">
	@use '../../vars' as *;

	.center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: $bg-0;
		padding-bottom: $padding;
	}

	.wrapper {
		display: flex;
		gap: $padding;
		margin-bottom: $small-padding;
	}

	.filename {
		font-weight: bold;
		font-size: $font-size;
	}

	.info {
		font-weight: bold;
		font-size: $font-size;
		color: $fg-1;
	}

	.download-icon {
		height: 40px;
		align-self: center;
	}

	.download-icon img {
		height: 100%;
	}

	.separator {
		// height: $module-border;
		border-top: $module-border solid $bg-2;
		width: 100%;
		margin-bottom: $small-padding;
	}

	.date {
		color: $fg-1;
	}

	.strong {
		font-weight: bold;
	}
</style>
