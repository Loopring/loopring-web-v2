export type EventAPI = {
  version: string;
  column: { key: string; label: string }[];
};
export type EventAPIExtender = {
  tableColumn: string[];
  filters: string[];
};
export type EventData = {
  eventTitle: string;
  subTitle: string;
  local: "en-US";
  banner: string;
  rule: string;
  ruleMarkdown?: string;
  rehypeRaw: "0" | "1";
  duration: {
    prev?: string;
    startDate: number;
    middle?: "to";
    endDate: number;
    end?: string;
  };
  api: EventAPI & Partial<EventAPIExtender>;
};

//TODO:test
//"https://static.loopring.io/events";
export const url_path = "https://localhost:3000/static/testEvents/";
export const Config_INFO_URL = "/api/v3/activity/getFilterInfo/";
export const Activity_URL = "/api/v3/activity/getActivityList/";
