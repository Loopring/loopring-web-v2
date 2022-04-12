export type EventAPI = {
  url: string;
  params?: {
    key: string;
    values: Array<{ label: string; value: string }>;
  };
  column: { key: string; label: string }[];
};
export type EventData = {
  eventTitle: string;
  subTitle: string;
  local: "en-US";
  duration: {
    prev?: string;
    startDate: number;
    middle?: "to";
    endDate: number;
    end?: string;
  };
  rewards: {
    project: string;
    pair: string;
    reward: {
      count: number;
      token: string;
    };
  }[];
  api?: EventAPI;
  rules: string[];
};
