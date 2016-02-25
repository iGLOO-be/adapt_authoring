// LICENCE https://github.com/adaptlearning/adapt_authoring/blob/master/LICENSE
define(function(require) {
  var Origin = require('coreJS/app/origin');
  var UserManagementView = require('./views/userManagementView.js');
  var UserManagementSidebarView = require('./views/userManagementSidebarView.js');
  var AddUserView = require('./views/addUserView.js');
  var AddUserSidebarView = require('./views/addUserSidebarView.js');
  var CustomHelpers = require('./helpers.js');

  var isReady = false;
  var data = {
    featurePermissions: ["*/*:create","*/*:read","*/*:update","*/*:delete"],
    allRoles: new Backbone.Collection(),
    allTenants: new Backbone.Collection()
  };

  Origin.on('app:dataReady login:changed', function() {
    console.log('User Management: app:dataReady login:changed');
  	if (Origin.permissions.hasPermissions(data.featurePermissions)) {
      data.allRoles.on('sync', onDataFetched);
      data.allRoles.url = 'api/role';
      data.allRoles.fetch();

      data.allTenants.on('sync', onDataFetched);
      data.allTenants.url = 'api/tenant';
      data.allTenants.fetch();

  		Origin.globalMenu.addItem({
        "location": "global",
        "text": "User Management",
        "icon": "fa-users",
        "callbackEvent": "userManagement:open"
      });
  	}
  });

  Origin.on('globalMenu:userManagement:open', function() {
    Origin.router.navigate('#/userManagement', {trigger: true});
  });

  Origin.on('router:userManagement', function(location, subLocation, action) {
    // unauthorised users can turn back around
    // TODO lang string
    if (!Origin.permissions.hasPermissions(data.featurePermissions)) {
      Origin.Notify.alert({
        type: 'warning',
        title: "No trespassing",
        text: "You aren't authorised to view this area."
      });
      Origin.router.navigate('#/dashboard');
      return;
    }

    if(isReady) {
      onRoute(location, subLocation, action);
    }
    else {
      Origin.on('userManagement:dataReady', function() {
        onRoute(location, subLocation, action);
      });
    }
  });

  var onRoute = function(location, subLocation, action) {
    var mainView, sidebarView;

    if(!location) {
      mainView = UserManagementView;
      sidebarView = UserManagementSidebarView;
    }
    else if('addUser' === location) {
      mainView = AddUserView;
      sidebarView = AddUserSidebarView;
    }

    Origin.router.createView(mainView, { model: new Backbone.Model({ globalData: data }) });
    Origin.sidebar.addView(new sidebarView().$el);
  };

  var onDataFetched = function() {
    // ASSUMPTION we always have roles and tenants
    if(data.allRoles.length > 0 && data.allTenants.length > 0) {
      isReady = true;
      Origin.trigger('userManagement:dataReady');
    }
  };
});
