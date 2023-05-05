export interface BirthdayData {
  id: string,
  birthday: Date;
  birthdayGif: string;
}

export const birthdays: BirthdayData[] =
  [{
    id: '122151155676479488',
    birthday: new Date(1992, 6, 2),
    birthdayGif: 'https://tenor.com/view/happy-birthdays-birthday-hbd-balloons-cake-gif-20718637'
  },

  {
    id: '123236460018139137',
    birthday: new Date(1994, 7, 15),
    birthdayGif: 'https://tenor.com/view/happy-birthday-happy-birthday-to-you-greetings-gif-12233702'
  },

  {
    id: '121072233274671104',
    birthday: new Date(1996, 6, 29),
    birthdayGif: 'https://tenor.com/view/happy-birthday-birthday-greetings-12th-birthday-gif-14721193'
  },

  {
    id: '121081221726863364',
    birthday: new Date(1993, 10, 1),
    birthdayGif: 'https://tenor.com/view/happy-birthday-to-you-happy-birthday-nick-sparkle-bokeh-gif-17069188'
  }
  ];
