////////////////////////////////////////////////////////////////////
// Timetable data types
////////////////////////////////////////////////////////////////////

export type Activity = {
  info: {
    title: string;
    attendants: string[];
    notes?: string;
  };
  date: {
    start: Date;
    end: Date;
  };
  id: string;
  name: string;
  style: {
    color?: string;
    size: number;
    position: number;
  };
};

export type Detention = {
  info: {
    title: string | undefined;
    teachers: string[];
    personnal: string[];
    classrooms: string[];
    notes?: string;
  };
  date: {
    start: Date;
    end: Date;
  };
  id: string;
  style: {
    color?: string;
    size: number;
    position: number;
  };
};

export type Classe = {
  info: {
    title: string | undefined;
    teachers: string[];
    personnal: string[];
    classrooms: string[];
    notes?: string;
  };
  status: {
    virtual: string[];
    canceled: boolean;
    state: string;
    exempted: boolean;
    test: boolean;
  };
  date: {
    start: Date;
    end: Date;
  };
  id: string;
  style: {
    color?: string;
    size: number;
    position: number;
  };
};

export type Holiday = {
  date: {
    start: Date;
    end: Date;
  };
  name: string;
  id: string;
}

export type Timetable = {
  classes: Classe[];
  activities: Activity[];
  detentions: Detention[];
  holidays: Holiday[];
};

////////////////////////////////////////////////////////////////////
// Notebook data types
////////////////////////////////////////////////////////////////////

export type Absence = {
  info: {
    reason?: string;
    days: number;
    hours: number;
    minutes: number;
  };
  date: {
    start: Date;
    end: Date;
  };
  id: string;
  status: {
    justified: boolean;
    opened: boolean;
    need_justification: boolean;
    administratively_fixed: boolean;
  }
}

export type Delay = {
  id: string;
  date: Date;
  minutes: number;
  status: {
    justified: boolean;
    administratively_fixed: boolean;
    need_justification: boolean;
  };
  info: {
    reason?: string;
    justification?: string;
  }
}

export type Punishment = {
  id: string;
  date: Date;
  info: {
    title: string;
    reasons: string[];
    duringLesson: boolean;
    giver: string;
  };
  exclusion: boolean;
  circumstances: string;
}

export type Observation = {
  id: string;
  date: Date;
  info: {
    name: string;
    kind: string;
    reason?: string;
    subject?: string;
  };
}

export type Measures = {

}

export type Notebook = {
  absences: Absence[];
  delays: Delay[];
  punisments: Punishment[];
  observations: Observation[];
  Measures: Measures[];
};

////////////////////////////////////////////////////////////////////
// Formatted data types with statistics
////////////////////////////////////////////////////////////////////

export type TimetableStats = {
  classes: {
    prof_times_saw:  [string, number][];
    avrage_duration: {
      hours: number;
    };
    total: number;
    notcanceled: {
      prof_times_saw:  [string, number][];
      total: number;
      per_canceled: {
        percent: number;
      };
      no_holidays: {
        total: number;
        per_canceled: {
          percent: number;
        };
      };
      avrage_duration: {
        hours: number;
      };
    };
    virtual: number;
    canceled: {
      prof_times_saw:  [string, number][];
      total: number;
      no_holidays: {
        total: number;
      };
      avrage_duration: {
        hours: number;
      };
    };
    exempted: number;
    test: number;
  };
  activities: {
    total: number;
  };
  detentions: {
    prof_times_saw:  [string, number][];
    total: number;
    per_notcanceled: {
      percent: number;
    };
    avrage_duration: {
      hours: number;
    };
  };
};

export type NotebookStats = {
  absences: {
    total: number;
    justified: number;
    need_justification: number;
    avrage_duration: {
      justified: number;
      not_justified: number;
    };
    top_reasons: [string, number][];
    total_time_absent: number;
    absent_during: {
      top_lessons: [string, number][];
      top_days_of_week: [string, number][];
      months: { [key: string]: number };
    }
  }
}

////////////////////////////////////////////////////////////////////
// UI types
////////////////////////////////////////////////////////////////////

export type StatCard = {
  title: string;
  description?: string;
  icon?: string;
  condition?: boolean | undefined;
  fields: ({
      separator: boolean;
      value: string | number;
      color?: string;
      valuedesc?: string;
      separatoricon?: string;
      separatortext?: string;
    } | undefined)[];
}

//////////////////////////////////////////////////////////////////
// Authentication types
//////////////////////////////////////////////////////////////////

export type UserLogin = {
  username: string;
  password: string;
  url: string;
  infos?: {
    name: string;
    profilepic: string;
    school: string;
  }
}
