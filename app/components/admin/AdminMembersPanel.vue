<template>
  <div class="dash-panel">
    <div class="dash-panel__head">
      <h3 class="dash-panel__title">
        <IconsUsers />
        اعضا
      </h3>
      <div class="dash-chart-meta">
        <span class="dash-chart-badge">{{ toPersian(members.subscribedToday) }} مشترک امروز</span>
      </div>
    </div>

    <div class="dash-panel__body">
      <div class="dash-members__stats">
        <div class="dash-members__stat">
          <span class="dash-members__stat-num">{{ toPersian(members.total) }}</span>
          <span class="dash-members__stat-label">کل اعضا</span>
        </div>
        <div class="dash-members__stat">
          <span class="dash-members__stat-num">{{ toPersian(members.notSubscribed) }}</span>
          <span class="dash-members__stat-label">عضو شده، مشترک نشده</span>
        </div>
      </div>

      <ClientOnly>
        <apexchart
          v-if="hasData"
          type="donut"
          :height="200"
          :options="options"
          :series="series"
        />
        <div v-else class="dash-chart-empty">
          هنوز عضوی ثبت‌نام نکرده است.
        </div>
        <template #fallback>
          <div class="dash-chart-skeleton" style="height:200px" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconsUsers from "../icons/Users.vue";

const props = defineProps<{
  members: { total: number; subscribedToday: number; subscribed: number; notSubscribed: number };
}>();

const hasData = computed(() => props.members.total > 0);
const series  = computed(() => [props.members.subscribed, props.members.notSubscribed]);

const options = computed(() => ({
  chart: {
    fontFamily: "Vazirmatn, Tahoma, Arial, sans-serif",
    animations: { enabled: true, easing: "easeinout", speed: 700 },
    background: "transparent",
  },
  // Forest + gold: the site's two actual brand accents, similar visual
  // weight so one segment doesn't read as "the real one" and the other as
  // a washed-out afterthought (previously forest paired with clay-soft, a
  // pale background-wash tone never meant to carry a bold chart segment).
  colors: ["#24483d", "#b08d46"],
  labels: ["مشترک خبرنامه", "مشترک نشده"],
  legend: {
    position: "bottom",
    fontFamily: "Vazirmatn",
    fontSize: "11px",
    fontWeight: 600,
    markers: { size: 6, offsetX: 4 },
    itemMargin: { horizontal: 6, vertical: 4 },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "62%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "کل اعضا",
            fontFamily: "Vazirmatn",
            fontSize: "12px",
            color: "#868c82",
            fontWeight: 600,
            formatter: () => toPersian(props.members.total),
          },
          value: {
            fontFamily: "Vazirmatn",
            fontWeight: 800,
            fontSize: "20px",
            color: "#1c1f1c",
            formatter: (v: string) => toPersian(parseInt(v)),
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
  stroke: { width: 2, colors: ["#ffffff"] },
  tooltip: {
    theme: "light",
    style: { fontFamily: "Vazirmatn" },
    y: { formatter: (v: number) => `${toPersian(v)} نفر` },
  },
}));
</script>
