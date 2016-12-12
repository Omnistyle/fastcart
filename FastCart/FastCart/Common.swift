//
//  Common.swift
//  FastCart
//
//  Created by Luis Perez on 11/25/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import EVReflection
import UIKit.UIGestureRecognizerSubclass

/**
 Contains commonly used keys for storing data locally.
 */
public enum Persistece: String {
    case receipt = "currentReceipt"
    case user = "currentUser"
    
    static let allValues = [receipt, user]
}

public class Constants {
    static let themeColor = UIColor(red: 114.0/255, green: 190.0/255, blue: 183.0/255, alpha: 1)
    static let kBannerHeight = CGFloat(40.0)
    static let paymentServerURL: String = "https://fastcart-braintree.herokuapp.com"
}

extension URL {
    func toJson() -> String {
        return self.absoluteString
    }
    static func fromJson(json: String?) -> URL? {
        if let url = json {
            return URL(string: url)
        }
        return nil
    }
}

enum Tab:Int{
    // Main tabs.
    case home = 0
    case scanner = 1
    case shopList = 2
    case profile = 3
}
enum ListTab: Int {
    case history = 0
    case receipt = 1
}

extension UITabBarController {
    /**
     Switches to the specified listTab. Note that if the current view controller 
     is not Tab.shopList, then this operation switches it to Tab.shopList in order
     to set the tab.
     */
    func switchTo(listTab: ListTab) {
        self.switchTo(tab: .shopList)
        
        let nvc = self.selectedViewController as! UINavigationController
        let tvc = nvc.viewControllers[0] as! TabViewController
        
        // Force load the view in case it's not loaded.
        let _ = tvc.view
        
        tvc.selectedIndex = listTab.rawValue
        nvc.popToRootViewController(animated: true)
    }
    
    /**
     Switches to the specified top level tab. Note that this does to do any additional work on
     the selected tab element. Therefore, whatever was previously in that tab navigation is
     still there.
     */
    func switchTo(tab: Tab) {
        self.selectedIndex = tab.rawValue
    }
}

/**
 The direction the recognizer detects. Note that the direction is defined according to the 
 velocity of the initial swipe.
 */
enum PanDirection {
    case vertical
    case horizontal
}

class PanDirectionGestureRecognizer: UIPanGestureRecognizer {
    
    private let direction : PanDirection
    
    /**
     Initialize a custom UIPanGestureRecognizer that only recognizers horizontal or vertical directions.
     
     - parameters:
        - direction: The PanDirection to recognize.
     */
    init(direction: PanDirection, target: AnyObject, action: Selector) {
        self.direction = direction
        super.init(target: target, action: action)
    }
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesMoved(touches, with: event)
        if state == .began {
            let v = velocity(in: self.view!)
            switch direction {
            case .horizontal where fabs(v.y) > fabs(v.x):
                state = .cancelled
            case .vertical where fabs(v.x) > fabs(v.y):
                state = .cancelled
            default:
                break
            }
        }
    }
}

/** Errors for FastCart */
struct FastCartError: Error {
    enum ErrorKind {
        case clientError
        case invalidUrl
        case generic
    }
    
    let message: String
    let kind: ErrorKind
}
