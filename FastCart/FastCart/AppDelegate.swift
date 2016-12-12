//
//  AppDelegate.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import FBSDKCoreKit
import Parse
import Braintree

enum AppURLSchemes: String {
    case payments = "lemonbunny.FastCart.payments"
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplicationLaunchOptionsKey: Any]?) -> Bool {
        // change navigation bar tint 
         UINavigationBar.appearance().tintColor = UIColor.black

        // Braintree app switch url!
        BTAppSwitch.setReturnURLScheme(AppURLSchemes.payments.rawValue)
        
        FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
        
        // handle tab bar setup 
        
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "tabBarController") as! UITabBarController
        vc.customInitialize()
        
        // change tint color to black
        UITabBar.appearance().tintColor = UIColor.black
        UINavigationBar.appearance().tintColor = UIColor.black
        if User.currentUser != nil {
            window?.rootViewController = vc
            
        }
        window?.tintColor = UIColor.black
        
        // hide the navigation bar
        UIApplication.shared.isStatusBarHidden = true
        
        // Initialize Parse
        // Set applicationId and server based on the values in the Heroku settings.
        // clientKey is not used on Parse open source unless explicitly configured
        // TODO: Why is this in open url?
        Parse.initialize(
            with: ParseClientConfiguration(block: { (configuration:ParseMutableClientConfiguration) -> Void in
                configuration.applicationId = "f0a1s2t3c4a5r6t728"
                configuration.clientKey = nil  // set to nil assuming you have not set clientKey
                configuration.server = "http://fastcart-parse.herokuapp.com/parse"
            })
        )
        
        NotificationCenter.default.addObserver(forName: User.userDidLogoutNotification, object: nil, queue: OperationQueue.main) { (Notification) in
            Utilities.clearDefaults()
        
            let storyboard = UIStoryboard(name: "Main", bundle: nil)
            let vc = storyboard.instantiateInitialViewController()
            self.window?.rootViewController = vc
        }
  
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplicationOpenURLOptionsKey : Any] = [:]) -> Bool {
        
        // Extract source application for compatibility with some older APIs.
        // We currently don't handle URLs if we don't know the application sending them.
        guard let sourceApplication: String = options[.sourceApplication] as? String else { return false }
        
        // Check if returning from payments.
        if url.scheme?.localizedCaseInsensitiveCompare(AppURLSchemes.payments.rawValue) == .orderedSame {
            return BTAppSwitch.handleOpen(url, sourceApplication:sourceApplication)
        } else {
            return FBSDKApplicationDelegate.sharedInstance().application(app, open: url, sourceApplication: sourceApplication, annotation: options[UIApplicationOpenURLOptionsKey.annotation])
        }
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

