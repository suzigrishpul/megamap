"use strict";
const LanguageManager = (($) => {
  //keyValue

  //targets are the mappings for the language
  return (lang = 'en') => {
    let language = lang;
    let dictionary = {};
    let $targets = $("[data-lang-target][data-lang-key]");

    console.log($targets);
    const updatePageLanguage = () => {

      $targets.each((index, item) => {
        let targetAttribute = $(item).data('lang-target');
        let langTarget = $(item).data('lang-key');

        switch(targetAttribute) {
          case 'text':
            $(item).text(dictionary[language][langTarget]);
            break;
          case 'value':
            $(item).val(dictionary[language][langTarget]);
            break;
          default:
            $(item).setAttribute(targetAttribute, dictionary[language][langTarget]);
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
          url: '/data/lang.json',
          dataType: 'json',
          success: (data) => {
            dictionary = data;
            language = lang;
            updatePageLanguage();
          }
        });
      },
      changeLanguage: (lang) => {
      }
    }
  };

})(jQuery);
