"use strict";
const LanguageManager = (($) => {
  //keyValue

  //targets are the mappings for the language
  return (lang = 'fr') => {
    let language = lang;
    let dictionary = {};
    let $targets = $("[data-lang-target][data-lang-key]");

    console.log($targets);
    const updatePageLanguage = () => {

      $targets.each((index, item) => {
        let targetAttribute = $(item).data('lang-target');
        let langTarget = $(item).data('lang-key');

        let targetItem = dictionary.rows.filter((i) => i.key === langTarget)[0];
        console.log("YYYI", targetItem);

        switch(targetAttribute) {
          case 'text':
            $(item).text(targetItem[language]);
            break;
          case 'value':
            $(item).val(targetItem[language]);
            break;
          default:
            $(item).attr(targetAttribute, targetItem[language]);
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
          url: 'http://gsx2json.com/api?id=1O3eByjL1vlYf7Z7am-_htRTQi73PafqIfNBdLmXe8SM&sheet=1',
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
