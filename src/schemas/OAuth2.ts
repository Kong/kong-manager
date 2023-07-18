import typedefs from './typedefs'

export default {
  fields: [
    { name: {} },
    {
      client_id: {
        submitWhenNull: false,
        hint: `You can optionally set your own unique client_id. If missing, it
               will be generated for you.`,
        inputType: 'password',
        encrypted: true,
      },
    },
    {
      client_secret: {
        submitWhenNull: false,
        hint: `You can optionally set your own unique client_secret. If missing,
               it will be generated for you.`,
        inputType: 'password',
        encrypted: true,
      },
    },
    {
      redirect_uris: typedefs.fields.arrayItems({
        label: 'Redirect URI(s)',
        hint: `One or more URLs in your app where users will be sent after
               authorization (RFC 6742 Section 3.1.2)`,
        newElementButtonLabel: '+ Add Redirect URI',
        inputAttributes: {
          placeholder: 'Enter URI',
        },
      }),
    },
  ],
}
