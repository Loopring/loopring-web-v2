export type EventData = {
  eventTitle: string;
  subTitle: string;
  "local": "en-US",
  duration: {
    prev: string;
    startDate: string;
    "to":"to";
    endDate: string;
    timeZone: string
  };
  rewards: {
    project: string;
    pair: string;
    reward: {
      count: number;
      token: string
    }
  }[];
  rules: string[];
}
