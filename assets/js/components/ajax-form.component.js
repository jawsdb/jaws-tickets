/**
 * <ajax-form>
 * -----------------------------------------------------------------------------
 * A form that talks to the backend using AJAX.
 * > For example usage, take a look at one of the forms generated in a new
 * > Sails app when using the "Web app" template.
 *
 * @type {Component}
 *
 * @slot default                     [form contents]
 *
 * @event update:cloudError          [.sync]
 * @event update:syncing             [.sync]
 * @event update:formErrors          [.sync]
 * @event submitted                  [emitted after the server responds with a 2xx status code]
 * @event rejected                   [emitted after the server responds with a non-2xx status code]
 * -----------------------------------------------------------------------------
 */

parasails.registerComponent('ajaxForm', {
  //  ╔═╗╦═╗╔═╗╔═╗╔═╗
  //  ╠═╝╠╦╝║ ║╠═╝╚═╗
  //  ╩  ╩╚═╚═╝╩  ╚═╝
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Note:
  // Some of these props rely on the `.sync` modifier re-introduced in Vue 2.3.x.
  // For more info, see: https://vuejs.org/v2/guide/components.html#sync-Modifier
  //
  // Specifically, these special props are:
  // • syncing
  // • cloudError
  // • formErrors
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  props: [
    'syncing',// « 2-way bound (.sync)
    'cloudError',// « 2-way bound (.sync)
    'action',
    'formErrors',// « 2-way bound (.sync)
    'formData',
    'formRules',

    'handleSubmitting',// « alternative for `action`
    'handleParsing',// « alternative for `formRules`+`formData`+`formErrors`
  ],

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: function (){
    return {
      //…
    };
  },

  //  ╦ ╦╔╦╗╔╦╗╦
  //  ╠═╣ ║ ║║║║
  //  ╩ ╩ ╩ ╩ ╩╩═╝
  template: `
  <form class="ajax-form" @submit.prevent="submit()">
    <slot name="default"></slot>
  </form>
  `,

  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    //…
  },
  mounted: async function (){
    if (this.action === undefined && this.handleSubmitting === undefined) {
      throw new Error('Neither `:action` nor `:handle-submitting` was passed in to <ajax-form>, but one or the other must be provided.');
    } else if (this.action !== undefined && this.handleSubmitting !== undefined) {
      throw new Error('Both `:action` AND `:handle-submitting` were passed in to <ajax-form>, but only one or the other should be provided.');
    } else if (this.action !== undefined && (!_.isString(this.action) || !_.isFunction(Cloud[_.camelCase(this.action)]))) {
      throw new Error('Invalid `action` in <ajax-form>.  `action` should be the name of a method on the `Cloud` global.  For example: `action="login"` would make this form communicate using `Cloud.login()`, which corresponds to the "login" action on the server.');
    } else if (this.action !== undefined && !_.isFunction(Cloud[this.action])) {
      throw new Error('Unrecognized `action` in <ajax-form>.  Did you mean to type `action="'+_.camelCase(this.action)+'"`?  (<ajax-form> expects `action` to be provided in camelCase format.  In other words, to reference the action at "api/controllers/foo/bar/do-something", use `action="doSomething"`.)');
    } else if (this.handleSubmitting !== undefined && !_.isFunction(this.handleSubmitting)) {
      throw new Error('Invalid `:handle-submitting` function passed to <ajax-form>.  For example: `:handle-submitting="handleSubmittingSomeForm"`.  This function should be an `async function`, and it should either throw a special exit signal or return response data from the server.  (If this custom `handleSubmitting` will be doing something more complex than a single request to a server, feel free to return whatever amalgamation of data you wish.)');
    }

    if (this.handleParsing === undefined && this.formData === undefined) {
      throw new Error('Neither `:form-data` nor `:handle-parsing` was passed in to <ajax-form>, but one or the other must be provided.');
    } else if (this.handleParsing !== undefined && this.formData !== undefined) {
      throw new Error('Both `:form-data` AND `:handle-parsing` were passed in to <ajax-form>, but only one or the other should be provided.');
    } else if (this.handleParsing !== undefined && !_.isFunction(this.handleParsing)) {
      throw new Error('Invalid `:handle-parsing` function passed to <ajax-form>.  For example: `:handle-parsing="handleParsingSomeForm"`.  This function should return a dictionary (plain JavaScript object like `{}`) of parsed form data, ready to be sent in a request to the server.');
    } else if (this.formData !== undefined && (!_.isObject(this.formData) || _.isFunction(this.formData) || _.isArray(this.formData))) {
      throw new Error('Invalid `:form-data` passed to <ajax-form>.  For example: `:form-data="someFormData"`.  This should reference a dictionary (plain JavaScript object like `{}`).  Specifically, `:form-data` should only be used in the case where the raw data from the form in the user interface happens to correspond **EXACTLY** with the names and format of the argins that should be sent in a request to the server.  (For more nuanced behavior, use `handle-parsing` instead!)');
    }

    if (!this.formData && (this.formRules || this.formErrors)) {
      throw new Error('If `:form-rules` or `:form-errors.sync` are in use, then `:form-data` must also be passed in.  (If the AJAX request doesn\'t need form data, then use an empty dictionary, i.e. `:form-data="{}"`.)');
    } else if (this.formRules && !this.formErrors) {
      throw new Error('If `:form-rules` are provided, then `:form-errors.sync` must also be passed in.');
    }

    if (this.formRules) {
      var SUPPORTED_RULES = [
        'required', 'isEmail', 'isIn', 'minLength', 'maxLength',
        'sameAs', 'isHalfwayDecentPassword'
      ];
      for (let fieldName in this.formRules) {
        for (let ruleName in this.formRules[fieldName]) {
          if (_.contains(SUPPORTED_RULES, ruleName)) {
            // OK.  Good enough.
            // - - - - - - - - - - - - - - - - - - - - -
            // FUTURE: move rule rhs checks out here
            // (so error messages from bad usage are
            // logged sooner)
            // - - - - - - - - - - - - - - - - - - - - -
          } else {
            let kebabRules = _.map(_.clone(SUPPORTED_RULES), (ruleName)=>_.kebabCase(ruleName));
            let lowerCaseRules = _.map(_.clone(SUPPORTED_RULES), (ruleName)=>ruleName.toLowerCase());
            let ruleIdx = (
              _.indexOf(kebabRules, ruleName) === -1 ?
              _.indexOf(lowerCaseRules, ruleName.toLowerCase()) === -1 ?
              -1
              : _.indexOf(lowerCaseRules, ruleName.toLowerCase())
              : _.indexOf(kebabRules, ruleName)
            );
            if (ruleIdx !== -1) {
              throw new Error('Did you mean `'+SUPPORTED_RULES[ruleIdx]+'`?  (note the capitalization)\nYou are seeing this error because <ajax-form> encountered an unsupported (but vaguely familiar-looking) client-side validation rule: `'+ruleName+'`.');
            } else {
              throw new Error('<ajax-form> does not support that client-side validation rule (`'+ruleName+'`).\n [?] If you\'re unsure, visit https://sailsjs.com/support');
            }
          }
        }//∞
      }//∞
    }

    // Focus our first field (but not on mobile, because it can get weird)
    if((typeof bowser !== 'undefined') && !bowser.mobile) {
      this.$focus('[focus-first]');
    }
  },
  beforeDestroy: function() {
    //…
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    submit: async function () {

      // Prevent double-posting.
      if (this.syncing) {
        console.log('wtf');
        return;
      }//•

      // Clear the userland "cloudError" prop.
      this.$emit('update:cloudError', '');

      // Determine the argins that will be sent to the server in our request.
      var argins;
      console.log(this);
      if (this.handleParsing) {
        // Run the provided "handle-parsing" logic.
        // > This should clear out any pre-existing error messages, perform any additional
        // > client-side form validation checks, and do any necessary data transformations
        // > to munge the form data into the format expected by the server.
        argins = this.handleParsing();
        if (argins === undefined) {
          // If argins came back undefined, then avast.
          // (This means that parsing the form failed.  Submission will not be attempted.)
          return;
        } else if (!_.isObject(argins) || _.isArray(argins) || _.isFunction(argins)) {
          throw new Error('Invalid data returned from custom form parsing logic.  (Should return a dictionary of argins, like `{}`.)');
        }//•
      } else if (this.formData) {
        // Or use the simpler, built-in absorbtion strategy.
        // > This uses the provided form data as our argins, verbatim.  Then it runs
        // > built-in client-side validation, if configured to do so.
        argins = this.formData;

        let formData = this.formData;
        let formErrors = {};

        for (let fieldName in this.formRules) {
          let fieldValue = formData[fieldName];

          for (let ruleName in this.formRules[fieldName]) {
            let ruleRhs = this.formRules[fieldName][ruleName];
            let violation;

            let isFieldValuePresent = (
              fieldValue !== undefined &&
              fieldValue !== '' &&
              !_.isNull(fieldValue)
            );

            if (ruleName === 'required' && ruleRhs === true) {
              // ® Must be defined, non-null, and not the empty string
              violation = (
                !isFieldValuePresent
              );
            } else if (!isFieldValuePresent) {
              // Do nothing.
              // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              // Note:
              // In order to allow use with optional fields, all rules except for
              // `required: true` are only actually checked when the field value
              // is "present" -- i.e. some value other than `null`, `undefined`,
              // or `''` (empty string).
              // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            } else if (ruleName === 'isEmail' && ruleRhs === true) {
              // ® Must be an email address (unless falsy)
              violation = (
                !parasails.util.isValidEmailAddress(fieldValue)
              );
            } else if (ruleName === 'isIn' && _.isArray(ruleRhs)) {
              // ® Must be one of these things
              violation = (
                _.contains(ruleRhs, fieldValue)
              );
            } else if (ruleName === 'minLength' && _.isNumber(ruleRhs)) {
              // ® Must consist of at least this many characters
              violation = (
                !_.isString(fieldValue) ||
                fieldValue.length < ruleRhs
              );
            } else if (ruleName === 'maxLength' && _.isNumber(ruleRhs)) {
              // ® Must consist of no more than this many characters
              violation = (
                !_.isString(fieldValue) ||
                fieldValue.length > ruleRhs
              );
            } else if (ruleName === 'sameAs' && ruleRhs !== '' && _.isString(ruleRhs)) {
              // ® Must match the value in another field
              let otherFieldName = ruleRhs;
              let otherFieldValue = formData[otherFieldName];
              violation = (
                otherFieldValue !== fieldValue
              );
            } else if (ruleName === 'isHalfwayDecentPassword' && ruleRhs === true) {
              // ® Must be a halfway-decent password
              // > This is an arbitrary distinction, so change it if you want.
              // > Just... please use common sense.  And try to avoid engaging
              // > in security theater.
              violation = (
                !_.isString(fieldValue) ||
                fieldValue.length < 6
              );
            } else {
              throw new Error('Cannot interpret client-side validation rule (`'+ruleName+'`) because the configuration provided for it is not recognized by <ajax-form>.\n [?] If you\'re unsure, visit https://sailsjs.com/support');
            }

            // If a rule violation was detected, then set it as a form error
            // and break out of the `for` loop to continue on to the next field.
            // (We only track one form error per field.)
            if (violation) {
              formErrors[fieldName] = ruleName;
              break;
            }//˚

          }//∞
        }//∞

        // Whether there are any errors or not, update userland "formErrors" prop
        // so that the markup reflects the new reality (i.e. inline validation errors
        // either get rendered or go away.)
        this.$emit('update:formErrors', formErrors);

        // If there were any form errors, avast.  (Submission will not be attempted.)
        if (Object.keys(formErrors).length > 0) {
          return;
        }//•
      }//ﬁ  (determining argins)


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: Potentially filter unused data in argins here before proceeding
      // (assuming cloudsdk has that information available)
      // Or better yet, just have `Cloud.*.with()` take care of that automatically.
      // console.log('about to send argins:',argins);
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // Set syncing state to `true` on userland "syncing" prop.
      this.$emit('update:syncing', true);


      // Submit the form
      var failedWithCloudExit;
      var rawErrorFromCloudSDK;
      var result;
      if (this.handleSubmitting) {
        try {
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // FUTURE: Consider cloning the argins ahead of time to prevent accidental mutation of form data.
          // (but remember argins could contain File instances that might not be clone-able)
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          result = await this.handleSubmitting(argins);
        } catch (err) {
          rawErrorFromCloudSDK = err;
          if (_.isString(err)) {
            failedWithCloudExit = err || 'error';
          } else if (_.isError(err)) {
            failedWithCloudExit = err.exit || 'error';
          } else if (_.isObject(err)) {
            failedWithCloudExit = Object.keys(err)[0] || 'error';
          } else {
            throw err;
          }
        }
      } else {
        result = await Cloud[this.action].with(argins)
        .tolerate((err)=>{
          rawErrorFromCloudSDK = err;
          failedWithCloudExit = err.exit || 'error';
        });
      }


      // When a cloud error occurs, tolerate it, but set the userland "cloudError"
      // prop accordingly.
      if (failedWithCloudExit) {
        this.$emit('update:cloudError', failedWithCloudExit);
      }

      // Set syncing state to `false` on userland "syncing" prop.
      this.$emit('update:syncing', false);

      // If the server says we were successful, then emit the "submitted" event.
      if (!failedWithCloudExit) {
        this.$emit('submitted', result);
      } else {
        this.$emit('rejected', rawErrorFromCloudSDK);
      }

    },

  }
});
