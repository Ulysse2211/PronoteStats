import * as types from "../../types"
import * as pronote from "pawnote";
import {getSession, logserv} from "../../utils";

export async function getTimetable (sessiondata: types.UserLogin) {
  let timetableJson: types.Timetable = {
    classes: [],
    activities: [],
    detentions: [],
    holidays: []
  };
  let session = await getSession(sessiondata)

  let last_week = 53;
  let week_no_frequecncy = 0
  for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
    if (week_no_frequecncy >= 3) {
      last_week = weekNumber - 3;
      break;
    }

    const weekFrequency = pronote.frequency(session, weekNumber);

    if (weekFrequency) {
      week_no_frequecncy = 0;
    }
    else {
      week_no_frequecncy++;
    }
  }

  let week = 1;
  while (week < last_week) {
    try {
      const timetable = await pronote.timetableFromWeek(session, week);
      pronote.parseTimetable(session, timetable, {
        withSuperposedCanceledClasses: false,
        withCanceledClasses: true,
        withPlannedClasses: true
      });
      for (const lesson of timetable.classes) {
        if (lesson.is === "activity") {
          let activity: types.Activity= {
            info: {
              title: lesson.title,
              attendants: lesson.attendants,
              notes: lesson.notes
            },
            date: {
              start: lesson.startDate,
              end: lesson.endDate
            },
            id: lesson.id,
            name: lesson.resourceTypeName,
            style: {
              color: lesson.backgroundColor,
              size: lesson.blockLength,
              position: lesson.blockPosition
            }
          };

          timetableJson.activities.push(activity);
        }

        else if (lesson.is === "detention") {
          let detention: types.Detention = {
            info: {
              title: lesson.title,
              teachers: lesson.teacherNames,
              personnal: lesson.personalNames,
              classrooms: lesson.classrooms,
              notes: lesson.notes
            },
            date: {
              start: lesson.startDate,
              end: lesson.endDate
            },
            id: lesson.id,
            style: {
              color: lesson.backgroundColor,
              size: lesson.blockLength,
              position: lesson.blockPosition
            }
          };

          timetableJson.detentions.push(detention);
        } else if (lesson.is === "lesson") {
          let classe: types.Classe = {
            info: {
              title: lesson.subject?.name,
              teachers: lesson.teacherNames,
              personnal: lesson.personalNames,
              classrooms: lesson.classrooms,
              notes: lesson.notes
            },
            status: {
              virtual: lesson.virtualClassrooms,
              canceled: lesson.canceled,
              state: lesson.status? lesson.status : "default",
              exempted: lesson.exempted,
              test: lesson.test
            },
            date: {
              start: lesson.startDate,
              end: lesson.endDate
            },
            id: lesson.id,
            style: {
              color: lesson.backgroundColor,
              size: lesson.blockLength,
              position: lesson.blockPosition
            }
          };
          timetableJson.classes.push(classe);
        }
      }
    } catch (e: any){
      if (e.code === pronote.SuspendedIPError || e.code === pronote.RateLimitedError) {
        await new Promise(resolve => setTimeout(resolve, 60 * 5000));
        console.log("Waiting for 5 minute...");
        continue;
      }  else if (e.code === pronote.SessionExpiredError){
        session = await getSession(sessiondata)
        continue;
      } else {
        console.log("Waiting for 5 minute and then making a new session...", e);
        await new Promise(resolve => setTimeout(resolve, 60 * 5000));
        session = await getSession(sessiondata)
        continue
      }
    }
    week++;
  }

  for (const holiday of session.instance.holidays) {

    timetableJson.holidays.push({name: holiday.name, date: {start: holiday.startDate, end: holiday.endDate}, id: holiday.id});
  }

  return timetableJson;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
 if (!body.username || !body.password || !body.url) {
    return {
      error: "Missing parameters"
    }
  } else if (typeof(body.username) !== "string" || typeof(body.password) !== "string" || typeof(body.url) !== "string") {
    return {
      error: "Parameters must be strings"
    }
  }
  const {url, password, username} = body
  if (!url.startsWith("http")) {
    return {
      error: "URL must start with http or https"
    }
  }

  const result = await getTimetable({
    url: url,
    password: password,
    username: username
  })

  logserv(`Timetable fetched for ${username}`, 1, "API/timetable")
  return send(event, JSON.stringify(result), 'application/json')
})
