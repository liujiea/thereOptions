// 省市县三级联动
var initProvinceCityAreaSelect = function( $province, $city, $area, _proviceCallback, _cityCallback, _areaCallback) {
  provinceCityAreaSelect( $province, $city, $area, _proviceCallback, _cityCallback, _areaCallback )
}

var provinceCityAreaSelect = function( $province, $city, $area, _proviceCallback, _cityCallback, _areaCallback ) {
  var bIsProvince = false;

  if( typeof $province !== "string" ) {
    bIsProvince = true;
    initProvinceSelect( $province, _proviceCallback );
  }
  if( $province ) {
    if( bIsProvince ) {
      initCitySelect( $city, $province.data("name"), _proviceCallback );
      $province.on("change", function(){
        var provinceID = $province.find( "option:selected" ).val();
        initCitySelect( $city, provinceID, function() {
          $city.trigger('change');
          _cityCallback && _cityCallback();
        }, null)
        if( !provinceID ) {
          $city.trigger('change');
        }
      });
    } else {
      initCitySelect( $city, $province, function() {
          //加载完成,触发pcs change 事件,以便初始化居委会
          $city.trigger("change");
          _cityCallback && _cityCallback();
        }, null);
    }
  }
  if( $area ) {
    initAreaSelect( $area, $city.data("name"), _proviceCallback );
    $city.on("change", function(){
      var cityID = $city.find( "option:selected" ).val();
      initAreaSelect( $area, cityID, _areaCallback, null )
    })
  }
}
//初始化省份
var initProvinceSelect = function( $province, _proviceCallback, _noDataTip ) {
  setSelectOption( $province, "正在加载省份" );
  _initCodeSelect( $province, "/Area/provincelist", null, {value: "ID", name : "DEPART_NAME"}, _proviceCallback, _noDataTip || "没有省份", "==省份==" )
}
//初始化城市
var initCitySelect = function( $city, provinceID, _cityCallback, _noDataTip ) {
  var chooseTip = "==城市==";
  if( !provinceID ) {
    setSelectOption( $city, chooseTip )
    return;
  }
  _initCodeSelect( $city, "/Area/citylist", provinceID, {value: "ID", name : "DEPART_NAME"}, _cityCallback, _noDataTip || "没有城市", chooseTip )
}
//初始化区域
var initAreaSelect = function( $area, cityID, _areaCallback, _noDataTip ) {
  var chooseTip = "==区域==";
  if( !cityID ) {
    setSelectOption( $area, chooseTip )
    return;
  }
  _initCodeSelect( $area, "/Area/arealist", cityID, {value: "ID", name : "DEPART_NAME"}, _areaCallback, _noDataTip || "没有区域", chooseTip )
}

//
var _initCodeSelect = function ( $province, url, urlData, field, _okCallback, _noDataTip, _chooseTip ) {
  getCodeList( url, urlData, function( list ) {
    setSelectOption( $province, list, field.value, field.name, _noDataTip,  _chooseTip)

    _okCallback && _okCallback( $province );
  }, function( msg ) {
    setSelectOption( $province, msg );
  })
}
//
var getCodeList = function( url, urlData, okCallback, _errorCallback ) {
  $.post( url, { ID : urlData || "" }, function( data ) {
    if( data.ResultCode ) {
      _errorCallback && _errorCallback( data.ResultText );
      return;
    }
    okCallback( data.Content );
  } )
}
//生成option方法
var setSelectOption = function( $select, data, valueKey, nameKey, noDataTip, chooseTip ) {
  var option = $select;
  //判断是否是一个纯粹的对象
  if( $.isPlainObject( $select ) ) {
    $select = option.$select;
    data = option.data;
    valueKey = option.valueKey;
    noDataTip = option.noDataTip;
    chooseTip = option.chooseTip;
  }
  if( typeof data === "string" ) {
    $select.html('<option value = "">{0}</option>'.format( data ) );
  } else {
    var opHtml = [];
    if( data == null || data.length === 0 ) {
      opHtml.push( '<option value="">{0}</option>'.format(noDataTip || "没有数据") );
    } else {
      opHtml.push('<option value="">{0}</option>'.format(chooseTip || "---请选择---"));
      for( var i = 0, len = data.length; i < len; i++ ) {
        opHtml.push( '<option value = "{0}" >{1}</option>'.format(getValue(data[i]), getName(data[i])) );
      }
    }
    $select.html( opHtml.join("") );
  }

  function getValue( itemData ) {
    if( typeof valueKey === "function" ) {
      return valueKey( itemData );
    }else {
      valueKey = valueKey || "value";
      return itemData[ valueKey ];
    }
  }
    function getName( itemData ) {
    if( typeof nameKey === "function" ) {
      return nameKey( itemData );
    }else {
      nameKey = nameKey || "name";
      return itemData[ nameKey ];
    }
  }
}
