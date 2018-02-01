module.exports = {
  siteMetadata: {
    title: `Pandas Eating Lots`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: 'gatsby-source-cockpit-headless-cms',
      options: {
        cockpitConfig: {
          COCKPIT_BASE_URL: 'http://localhost:8888',
          COCKPIT_FOLDER: '/cockpit',
          ACCESS_TOKEN: '4d659efb084077fd24aeb4871d4386',
        },
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-glamor`,
  ],
};
