import * as types from "../types"
import {logclient} from "../utils";

// function to get the stats of a certain timetable
export function getTimetableStats(timetable: types.Timetable) {
  let stats: types.TimetableStats= {
    classes: {
      prof_times_saw: [],
      avrage_duration: {
        hours: 0,
      },
      total: 0,
      notcanceled: {
        prof_times_saw: [],
        total: 0,
        per_canceled: {
          percent: 0,
        },
        no_holidays: {
          total: 0,
          per_canceled: {
            percent: 0,
          }
        },
        avrage_duration: {
          hours: 0,
        }
      },
      virtual: 0,
      canceled: {
        prof_times_saw: [],
        total: 0,
        no_holidays: {
          total: 0
        },
        avrage_duration: {
          hours: 0,
        }
      },
      exempted: 0,
      test: 0
    },
    activities: {
      total: 0,
    },
    detentions: {
      total: 0,
      prof_times_saw: [],
      per_notcanceled: {
        percent: 0,
      },
      avrage_duration: {
        hours: 0,
      }
    }
  };

  if (!timetable || !timetable.classes || !timetable.activities || !timetable.detentions) {
    return stats;
  }

  let prof_times_saw_classes: { [key: string]: number } = {}
  let prof_times_saw_notcanceled: { [key: string]: number } = {}
  let prof_times_saw_canceled: { [key: string]: number } = {}
  let prof_times_saw_detention: { [key: string]: number } = {}

  let detention_avg_dur = []
  let notcanceled_avg_dur = []
  let canceled_avg_dur = []
  let classes_avg_dur = []

  stats.activities.total = timetable.activities.length
  stats.detentions.total = timetable.detentions.length

  for (const detention of timetable.detentions) {
    detention_avg_dur.push((new Date(detention.date.end).getTime() - new Date(detention.date.start).getTime()) / 3600000)

    for (const teacher of detention.info.teachers) {
      if (!prof_times_saw_detention[teacher]) {
        prof_times_saw_detention[teacher] = 1;
      }
      prof_times_saw_detention[teacher] += 1;
    }
  }

  for (const lesson of timetable.classes) {
    let isHoliday = false;
    for (const holiday of timetable.holidays) {
      const a: boolean = new Date(lesson.date.start) >= new Date(holiday.date.start) && new Date(lesson.date.end) <= new Date(holiday.date.end);
      if (a) {
        isHoliday = true;
        break;
      }
    }
    if (!isHoliday) {
      stats.classes.total++;
      classes_avg_dur.push((new Date(lesson.date.end).getTime() - new Date(lesson.date.start).getTime()) / 3600000)
      for (const teacher of lesson.info.teachers) {
        if (!prof_times_saw_classes[teacher]) {
          prof_times_saw_classes[teacher] = 1;
        }
        prof_times_saw_classes[teacher] += 1;
      }
    }
    if (lesson.status.virtual.length > 0) {
      stats.classes.virtual++;
    }
    if (lesson.status.canceled) {
      stats.classes.canceled.total++;
      if (!isHoliday) {
        stats.classes.canceled.no_holidays.total++;
        canceled_avg_dur.push((new Date(lesson.date.end).getTime() - new Date(lesson.date.start).getTime()) / 3600000)
        for (const teacher of lesson.info.teachers) {
          if (!prof_times_saw_canceled[teacher]) {
            prof_times_saw_canceled[teacher] = 1;
          }
          prof_times_saw_canceled[teacher] += 1;
        }
      }
    } else {
       stats.classes.notcanceled.total++;
       if (!isHoliday) {
         stats.classes.notcanceled.no_holidays.total++;
         notcanceled_avg_dur.push((new Date(lesson.date.end).getTime() - new Date(lesson.date.start).getTime()) / 3600000)
          for (const teacher of lesson.info.teachers) {
            if (!prof_times_saw_notcanceled[teacher]) {
              prof_times_saw_notcanceled[teacher] = 1;
            }
            prof_times_saw_notcanceled[teacher] += 1;
          }
       }
    }
    if (lesson.status.exempted) {
      stats.classes.exempted++;
    }
    if (lesson.status.test) {
      stats.classes.test++;
    }
  }

  stats.classes.notcanceled.per_canceled.percent = Number.parseFloat((stats.classes.canceled.total / stats.classes.total * 100).toFixed(2));
  stats.classes.notcanceled.no_holidays.per_canceled.percent = Number.parseFloat((stats.classes.canceled.no_holidays.total / stats.classes.notcanceled.no_holidays.total * 100).toFixed(2));

  stats.detentions.per_notcanceled.percent = Number.parseFloat((stats.detentions.total / stats.classes.notcanceled.total * 100).toFixed(2));

  stats.detentions.avrage_duration.hours = Number.parseFloat((detention_avg_dur.reduce((a, b) => a + b, 0) / stats.detentions.total).toFixed(2));
  stats.classes.avrage_duration.hours = Number.parseFloat((classes_avg_dur.reduce((a, b) => a + b, 0) / stats.classes.total).toFixed(2));
  stats.classes.notcanceled.avrage_duration.hours = Number.parseFloat((notcanceled_avg_dur.reduce((a, b) => a + b, 0) / stats.classes.notcanceled.total).toFixed(2));
  stats.classes.canceled.avrage_duration.hours = Number.parseFloat((canceled_avg_dur.reduce((a, b) => a + b, 0) / stats.classes.canceled.total).toFixed(2));

  stats.detentions.prof_times_saw = Object.entries(prof_times_saw_detention).sort((a, b) => b[1] - a[1]);
  stats.classes.prof_times_saw = Object.entries(prof_times_saw_classes).sort((a, b) => b[1] - a[1]);
  stats.classes.notcanceled.prof_times_saw = Object.entries(prof_times_saw_notcanceled).sort((a, b) => b[1] - a[1]);
  stats.classes.canceled.prof_times_saw = Object.entries(prof_times_saw_canceled).sort((a, b) => b[1] - a[1]);

  logclient(`Computed new timetable stats`, 1, "STATS/Timetable", stats)
  return stats;
}

export function getNotebookStats(notebook: types.Notebook, timetable: types.Timetable) {
  let stats: types.NotebookStats = {
    absences: {
      total: 0,
      justified: 0,
      need_justification: 0,
      avrage_duration: {
        justified: 0,
        not_justified: 0,
      },
      top_reasons: [],
      total_time_absent: 0,
      absent_during: {
        top_lessons: {},
        top_days_of_week: {},
        months: {},
      }
    }
  };

  if (!notebook || !notebook.absences) {
    console.log(notebook)
    return stats;
  }

  let justified_avg_dur = 0; // in minutes
  let not_justified_avg_dur = 0; // in minutes
  let total_time_absent = 0; // in minutes
  let top_reasons: { [key: string]: number } = {}; // { reason: count }
  let top_lessons: { [key: string]: number } = {}; // { lesson: count }
  let top_days: { [key: number]: number } = {}; // { day: count }
  let months_count: { [key: number]: number} = {}; // { month: count }


  for (const absence of notebook.absences) {
    stats.absences.total++;
    const duration = absence.info.hours * 60 + absence.info.minutes;
    total_time_absent += duration;
    if (absence.status.justified) {
      stats.absences.justified++;
      justified_avg_dur += duration;
    } else {
      stats.absences.need_justification++;
      not_justified_avg_dur += duration;
    }

    const reason = absence.info.reason ? absence.info.reason : "Unknown"
    if (!top_reasons[reason]) { top_reasons[reason] = 0; }
    top_reasons[reason]++;

    // determine the lessons name that happened during the absence from start to end
    let start = new Date(absence.date.start).getTime();
    let end = new Date(absence.date.end).getTime();

    for (const lesson of timetable.classes) {
      const lesson_start = new Date(lesson.date.start).getTime();
      const lesson_end = new Date(lesson.date.end).getTime();
      if (lesson_start >= start && lesson_end <= end) {
        if (lesson.info.title) {
          if (!top_lessons[lesson.info.title]) {
            top_lessons[lesson.info.title] = 0;
          }
          // @ts-ignore
          top_lessons[lesson.info.title]++;
        }
      }
    }


    let day_of_week = new Date(absence.date.start).getDay();
    for (let i = 0; i < absence.info.days; i++) {
      let new_day_of_week = (day_of_week + i) % 7;
      if (!top_days[new_day_of_week]) { top_days[new_day_of_week] = 0; }
      top_days[new_day_of_week]++;
    }

    let month = new Date(absence.date.start).getMonth();
    if (!months_count[month]) { months_count[month] = 0; }
    months_count[month]++;
  }

  stats.absences.avrage_duration.justified = Number.parseFloat((justified_avg_dur / stats.absences.justified).toFixed(2));
  stats.absences.avrage_duration.not_justified = Number.parseFloat((not_justified_avg_dur / stats.absences.need_justification).toFixed(2));
  stats.absences.total_time_absent = total_time_absent;
  stats.absences.top_reasons = Object.entries(top_reasons).sort((a, b) => b[1] - a[1])
  stats.absences.absent_during.top_lessons = Object.entries(top_lessons).sort((a, b) => b[1] - a[1])
  stats.absences.absent_during.top_days_of_week = Object.entries(top_days).sort((a, b) => b[1] - a[1])
  stats.absences.absent_during.months = months_count;

  logclient(`Computed new notebook stats`, 1, "STATS/Notebook", stats)
  return stats;
}
