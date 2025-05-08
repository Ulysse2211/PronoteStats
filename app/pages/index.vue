<script setup lang="ts">
import {selectFirstAccount} from '~/accountHelper'
import {selectedAccount, timetableStats, notebookStats} from '~/sharedHelper'
import * as types from '../../types'

await selectFirstAccount() // select default account

// First carousel, with the timetable stats
const TimetableCarouselStats: Ref<types.StatCard[]> | Ref<null> = ref(null)
function updateTimetableCarousel() {
  TimetableCarouselStats.value = [
    {
      title: "Annulation des cours",
      description: "Voici vos statistiques sur l'annulation des cours.",
      icon: "i-lucide-book-open",
      fields: [
        {
          separator: false,
          value: (timetableStats.value?.classes.notcanceled.per_canceled.percent? timetableStats.value?.classes.notcanceled.per_canceled.percent : 0) + "%",
          valuedesc: "des cours ont été annulés",
        },
        {
          separator: true,
          separatoricon: "i-lucide-book-open",
          value: (timetableStats.value?.classes.notcanceled.total? timetableStats.value?.classes.notcanceled.total : 0),
          valuedesc: "cours ne sont pas annulés",
        },
        {
          separator: false,
          separatoricon: "i-lucide-book-open",
          value: (timetableStats.value?.classes.canceled.total? timetableStats.value?.classes.canceled.total : 0),
          valuedesc: "cours sont annulés",
        }
      ]
    },
    {
      title: "Retenue",
      description: "Voici vos statistiques sur les retenues.",
      icon: "i-lucide-shield-alert",
      condition: (timetableStats.value ? timetableStats.value.detentions.total > 0 : false),
      fields: [
        {
          separator: false,
          value: (timetableStats.value?.detentions.per_notcanceled.percent? timetableStats.value?.detentions.per_notcanceled.percent : 0) + "%",
          valuedesc: "des séances sont des retenues",
        },
        {
          separator: true,
          separatoricon: "i-lucide-shield-alert",
          value: (timetableStats.value?.detentions.total? timetableStats.value?.detentions.total : 0),
          valuedesc: "retenue(s) sur l'année",
        }
      ]
    },
    {
      title: "Durées",
      description: "Voici vos statistiques sur les durées de différents éléments.",
      icon: "i-lucide-clock",
      fields: [
        {
          separator: true,
          separatoricon: "i-lucide-shield-alert",
          value: (timetableStats.value?.detentions.avrage_duration.hours? timetableStats.value?.detentions.avrage_duration.hours : 0) + "h",
          valuedesc: "est la durée moyenne des retenues",
        },
        {
          separator: true,
          separatoricon: "i-lucide-clock",
          value: (timetableStats.value?.classes.avrage_duration.hours? timetableStats.value?.classes.avrage_duration.hours : 0) + "h",
          valuedesc: "est la durée moyenne des cours, annulés et non annulés, hors vacances",
        },
        {
          separator: false,
          value: (timetableStats.value?.classes.notcanceled.avrage_duration.hours? timetableStats.value?.classes.notcanceled.avrage_duration.hours : 0) + "h",
          valuedesc: "est la durée moyenne des cours non annulés, hors vacances",
        },
        {
          separator: false,
          value: (timetableStats.value?.classes.canceled.avrage_duration.hours? timetableStats.value?.classes.canceled.avrage_duration.hours : 0) + "h",
          valuedesc: "est la durée moyenne des cours annulés, hors vacances",
        }
      ]
    },
    {
      title: "Absences Professeurs",
      description: "Voici vos statistiques sur les absences de vos professeurs.",
      icon: "i-lucide-person-standing",
      fields: (
        timetableStats.value?.classes.canceled.prof_times_saw || []
      )
        .map(([prof, canceled]) => {
          const total = timetableStats.value?.classes.prof_times_saw.find(([key]) => key === prof)?.[1] || 0;
          const percent = total > 0 ? Number.parseFloat((canceled / total * 100).toFixed(2)) : 0;

          return {
            prof,
            canceled,
            total,
            percent
          };
        })
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5)
        .map((item, i) => ({
          separator: i === 0,
          separatoricon: i === 0 ? "i-lucide-person-standing" : undefined,
          separatortext: i === 0 ? "Classement des professeurs absents" : undefined,
          value: item.prof ? `${i + 1}. ${item.prof}, absent(e) ${item.percent}%` : "Inconnu",
          valuedesc: item.prof ? `des cours soit ${item.canceled} fois` : ""
        }))
    },
    {
      title: "Professeurs ayant le plus de cours avec vous",
      description: "Voici vos statistiques sur les professeurs que vous avez le plus.",
      icon: "i-lucide-graduation-cap",
      fields: [0, 1, 2, 3, 4].map(i => {
        const prof = timetableStats.value?.classes.notcanceled.prof_times_saw[i]?.[0];
        const notcanceled = timetableStats.value?.classes.notcanceled.prof_times_saw[i]?.[1] || 0;
        const total = timetableStats.value?.classes.prof_times_saw.find(([key]) => key === prof)?.[1] || 0;
        const canceled = timetableStats.value?.classes.canceled.prof_times_saw.find(([key]) => key === prof)?.[1] || 0;
        const percent = total > 0 ? Number.parseFloat((canceled / total * 100).toFixed(2)) : 0;

        return {
          separator: i === 0,
          separatoricon: i === 0 ? "i-lucide-graduation-cap" : undefined,
          separatortext: i === 0 ? "Classement des professeurs que vous avez le plus" : undefined,
          value: prof ? `${i + 1}. ${prof}, ${notcanceled} fois` : "Inconnu",
          valuedesc: prof ? `Absent(e) à ${percent}% des cours` : ""
        };
      })
    }
  ]
  for (const item of TimetableCarouselStats.value) {
    if (item.condition === false) {
      TimetableCarouselStats.value = TimetableCarouselStats.value.filter(i => i !== item)
    }
  }
}

updateTimetableCarousel()
watch(timetableStats, updateTimetableCarousel, { deep: true })

const NotebookCarouselStats: Ref<types.StatCard[]> | Ref<null> = ref(null)
function updateNotebookCarousel() {
  NotebookCarouselStats.value = [
    {
      title: "Raison des absences",
      description: "Les raisons les plus courrantes de vos absences.",
      icon: "i-lucide-monitor-x",
      condition: (notebookStats.value ? notebookStats.value.absences.top_reasons.length > 0 : false),
      fields: [0, 1, 2, 3, 4].map(i => {
        let reason = notebookStats.value?.absences.top_reasons[i] ? notebookStats.value?.absences.top_reasons[i][0] : undefined
        let count = notebookStats.value?.absences.top_reasons[i] ? notebookStats.value?.absences.top_reasons[i][1] : undefined
        if (reason === undefined || count === undefined) { return; }
        return {
          separator: false,
          value: `${i + 1}. ${reason}`,
          valuedesc: `a eu ${count} fois`
        }
      })
    },
    {
      title: "Durées",
      description: "Voici vos statistiques sur les durées de différents éléments.",
      icon: "i-lucide-clock",
      fields: [
        {
          separator: false,
          value: (notebookStats.value ? notebookStats.value.absences.avrage_duration.not_justified / 60 : 0).toFixed(2) + "h",
          valuedesc: "est la durée moyenne des absences non justifiés",
        },
        {
          separator: false,
          value: (notebookStats.value ? notebookStats.value.absences.avrage_duration.justified / 60 : 0).toFixed(2) + "h",
          valuedesc: "est la durée moyenne des absences justifiés",
        },
        {
          separator: true,
          value: (notebookStats.value ? notebookStats.value.absences.total_time_absent / 60 : 0).toFixed(2) + "h",
          valuedesc: "est la durée total d'absence",
        }
      ]
    },
    {
      title: "Jours des absences",
      description: "Voici vos statistiques sur les jours de la semaines où vous êtes le plus absent.",
      icon: "i-lucide-calendar-days",
      condition: notebookStats.value?.absences.absent_during.top_days_of_week.length > 0,
      fields: [0, 1, 2, 3, 4].map(i => {
        const entry = notebookStats.value?.absences.absent_during.top_days_of_week[i];
        if (entry === undefined) { return; }
        let day = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][entry[0]]
        let count = entry[1]
        if (day === undefined || count === undefined) { return ; }
        return {
          separator: false,
          value: `${i + 1}. ${day}`,
          valuedesc: `absent ${count} fois`
        }
      })
    },
    {
      title: "Cours",
      description: "Voici vos statistiques sur les cours où vous êtes le plus absent.",
      icon: "i-lucide-calendar-days",
      condition: notebookStats.value?.absences.absent_during.top_days_of_week.length > 0,
      fields: [0, 1, 2, 3, 4].map(i => {
        const entry = notebookStats.value?.absences.absent_during.top_lessons[i];
        if (entry === undefined) { return; }
        let lesson = entry[0]
        let count = entry[1]
        if (lesson === undefined || count === undefined) { return ; }
        return {
          separator: false,
          value: `${i + 1}. ${lesson}`,
          valuedesc: `absent ${count} fois`
        }
      })
    },
  ]
  for (const item of NotebookCarouselStats.value) {
    for (const field of item.fields) {
      if (field === undefined) {
        item.fields = item.fields.filter(i => i !== field)
      }
    }
    if (item.condition === false) {
      NotebookCarouselStats.value = NotebookCarouselStats.value.filter(i => i !== item)
    }
  }
}

updateNotebookCarousel()
watch(notebookStats, updateNotebookCarousel, { deep: true })
</script>

<template>
  <div v-if="!selectedAccount" style="height: 85vh" class="flex justify-center items-center">
    <Login/>
  </div>
  <div v-if="selectedAccount">
    <div class="m-3 md:m-10">
      <SectionTitle label="Emploi du temps" />
      <UCard variant="subtle">
        <UCarousel
          loop
          dots
          :autoplay="{ delay: 5000 }"
          class="flex m-3 md:m-10"
          :items="TimetableCarouselStats"
          v-slot="{ item }"
          :ui="{ item: 'basis-1/1 2xl:basis-1/3', container: 'w-[89dvw]' }"
        >
          <CarouselCard :item="item" />
        </UCarousel>
      </UCard>
    </div>
    <div class="m-3 md:m-10">
      <SectionTitle label="Carnet" />
      <UCard variant="subtle">
        <UCarousel
          loop
          dots
          :autoplay="{ delay: 5000 }"
          class="flex m-3 md:m-10"
          :items="NotebookCarouselStats"
          v-slot="{ item }"
          :ui="{ item: 'basis-1/1 2xl:basis-1/3', container: 'w-[89dvw]' }"
        >
          <CarouselCard :item="item" />
        </UCarousel>
      </UCard>
    </div>
    <!-- <Chart title="Proportion des enseignants"/> -->
  </div>
</template>
