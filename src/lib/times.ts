class Times {
  second = 1;
  minute = this.second * 60;
  hour = this.minute * 60;
  day = this.hour * 24;
  week = this.day * 7;
  month = this.day * 30.4375;
  year = this.month * 12;
  decade = this.year * 10;
  century = this.decade * 10;
  millennium = this.century * 10;
}

export const times = new Times();