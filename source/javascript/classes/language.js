"use strict";
const LanguageManager = (($) => {
  //keyValue

  //targets are the mappings for the language
  return () => {
    let language;
    let dictionary = {};
    let $targets = $("[data-lang-target][data-lang-key]");

    const updatePageLanguage = () => {

      let targetLanguage = dictionary.rows.filter((i) => i.lang === language)[0];

      $targets.each((index, item) => {
        let targetAttribute = $(item).data('lang-target');
        let langTarget = $(item).data('lang-key');

        // console.log(langTarget);
        switch(targetAttribute) {
          case 'text':
            // console.log($(item), "TARGET :: ", langTarget, " --- ", targetLanguage[langTarget]);
            $(item).text(targetLanguage[langTarget]);
            break;
          case 'value':
            $(item).val(targetLanguage[langTarget]);
            break;
          default:
            $(item).attr(targetAttribute, targetLanguage[langTarget]);
            break;
        }
      })
    };

    return {
      language,
      targets: $targets,
      dictionary,
      initialize: (lang) => {

        $.ajax({
          // url: 'https://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
          url: '/data/lang.json',
          dataType: 'json',
          success: (data) => {
            dictionary = data;
            language = lang;
            updatePageLanguage();

            $(document).trigger('trigger-language-loaded');

            $("#language-opts").multiselect('select', lang);
          }
        });
      },
      refresh: () => {
        updatePageLanguage(language);
      },
      updateLanguage: (lang) => {

        language = lang;
        updatePageLanguage();
      },
      getTranslation: (key) => {
        let targetLanguage = dictionary.rows.filter((i) => i.lang === language)[0];
        return targetLanguage[key];
      }
    }
  };

})(jQuery);
