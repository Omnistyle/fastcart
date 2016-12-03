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
        // Braintree app switch url!
        BTAppSwitch.setReturnURLScheme(AppURLSchemes.payments.rawValue)
        
        FBSDKApplicationDelegate.sharedInstance().application(application, didFinishLaunchingWithOptions: launchOptions)
        
        // handle tab bar setup 
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "tabBarController") as! UITabBarController
        let tabBar = vc.tabBar as UITabBar
        let tabBarItem1 = tabBar.items![0] as UITabBarItem
        let tabBarItem2 = tabBar.items![1] as UITabBarItem
        let tabBarItem3 = tabBar.items![2] as UITabBarItem
        let tabBarItem4 = tabBar.items![3] as UITabBarItem
        let tabBarItem5 = tabBar.items![4] as UITabBarItem
        
        
        tabBarItem1.selectedImage = #imageLiteral(resourceName: "store_filled")
        tabBarItem2.selectedImage = #imageLiteral(resourceName: "camera_filled")
        tabBarItem3.selectedImage = #imageLiteral(resourceName: "list_filled")
        tabBarItem4.selectedImage = #imageLiteral(resourceName: "credit_card_filled_final")
        tabBarItem5.selectedImage = #imageLiteral(resourceName: "profile_filled")
        
        // nonselected color to black
        for tabItem in tabBar.items! {
            let item = tabItem
            item.image = item.image?.withRenderingMode(.alwaysOriginal)
            item.setTitleTextAttributes(["NSForegroundColorAttributeName":UIColor.black], for: .normal)
            // change the iimage insets to only have the image
            item.imageInsets = UIEdgeInsets(top: 7, left: 0, bottom: -7, right: 0)
        }
        
        // change tint color to black
        UITabBar.appearance().tintColor = UIColor.black
        if User.currentUser != nil {
            window?.rootViewController = vc
            
        }
        
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

