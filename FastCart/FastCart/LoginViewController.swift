//
//  LoginViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 11/14/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import FBSDKLoginKit

class LoginViewController: UIViewController, FBSDKLoginButtonDelegate {

    var currentUser : User!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let loginButton = FBSDKLoginButton()
        view.addSubview(loginButton)
        
        loginButton.frame = CGRect(x: 16, y: 50, width: view.frame.width - 32, height: 50)
        loginButton.delegate = self
        loginButton.readPermissions = ["email", "public_profile"]
        
        // Do any additional setup after loading the view.
    }

    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        print("did log out of facebook")
    }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if error != nil {
            print(error)
            return
        }
        
        print("succesfully login with facebook...")
        
        FBSDKGraphRequest(graphPath: "/me", parameters: ["fields" : "id, name, email"]).start { (connecion, result, error) in
            if error != nil {
                print("failed to start graph")
                print(error?.localizedDescription)
                return
            }
            
            //            var facebookid = result.valueForKey("name") as NSString
            //            var username = result.valueForKey("name") as? String
            //            var userEmail = result.valueForKey("email") as? String
            
            print(result)
            
            self.performSegue(withIdentifier: "successloginsegue", sender: nil)
            
            //successloginsegue
        }
        
        //        "id": "1008223822",
        //        "first_name": "Dj\u00e9",
        //        "gender": "male",
        //        "last_name": "Destolicci",
        //        "link": "https://www.facebook.com/dje.destolicci",
        //        "locale": "fr_FR",
        //        "name": "Dj\u00e9 Destolicci",
        //        "username": "dje.destolicci"
        
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
