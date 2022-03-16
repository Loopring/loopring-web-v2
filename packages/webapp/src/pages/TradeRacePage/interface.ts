export type EventData = {
  eventTitle: string;
  subTitle: string;
  local: "en-US";
  duration: {
    prev?: string;
    startDate: number;
    middle?: "to";
    endDate?: number;
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
  api?: {
    url: string;
    params?: any;
    column: { key: string; label: string }[];
  };
  rules: string[];
};
