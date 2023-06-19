export type EventAPI = {
  version: string;
  column: { key: string; label: string }[];
  start: number;
  end: number;
};
export type EventAPIExtender = {
  tableColumn: string[];
  filters: string[];
};
export type EventData = {
  eventTitle: string;
  subTitle: string;
  local: "en-US";
  banner: {
    laptop?: string;
    mobile?: string;
    pad?: string;
  };
  showBannerOrTitle: "0" | "1";
  rule: string;
  ruleMarkdown?: string;
  rehypeRaw: "0" | "1";
  duration: {
    prev?: string;
    startDate: number;
    middle?: "to";
    endDate: number;
    end?: string;
    timeZone?: string;
  };
  api: EventAPI & Partial<EventAPIExtender>;
};

export type API_DATA<R extends object> = {
  version: number;
  selected: string;
  owner: {
    rank: string;
    accountId: string;
    address: string;
    usdtValue: string;
  };
  data: R[];
};

export const Config_INFO_URL = "api/v3/activity/getFilterInfo";
export const Activity_URL = "/api/v3/activity/getActivityList";
