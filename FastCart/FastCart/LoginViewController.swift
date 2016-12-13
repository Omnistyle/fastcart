//
//  LoginViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 11/14/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import FBSDKLoginKit
import Parse

class LoginViewController: UIViewController, FBSDKLoginButtonDelegate {
    struct Constants {
        static let facebookButtonLeftRightMargin: CGFloat = 30
        static let facebookButtonHeight: CGFloat = 50
        static let facebookButtonBottomMargin: CGFloat = 160
    }
    
    @IBOutlet weak var ordividerView: UIView!
    
    @IBOutlet weak var userpassloginView: UIView!
    

    @IBOutlet weak var loginView: UIImageView!
    @IBOutlet weak var usernameLabel: UITextField!
    
    @IBOutlet weak var passwordLabel: UITextField!
    
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    
    @IBOutlet weak var loginButton: UIButton!
    
    @IBOutlet weak var signupButton: UIButton!
    
    var shiftedUp : Bool = false
    
    var dict : NSDictionary!
    //self.dict = result as NSDictionary
    
    var currentUser : User!
    

    var fbloginButton : FBSDKLoginButton!
    
    var shifitngValue : Int = 100//130
    
    var keyboardPrecense: Bool = false
    
    // navigation bar formatting
    private var shadowImageView: UIImageView?

    private func findShadowImage(under view: UIView) -> UIImageView? {
        if view is UIImageView && view.bounds.size.height <= 1 {
            return (view as! UIImageView)
        }
        
        for subview in view.subviews {
            if let imageView = findShadowImage(under: subview) {
                return imageView
            }
        }
        return nil
    }
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if shadowImageView == nil {
            shadowImageView = findShadowImage(under: navigationController!.navigationBar)
        }
        shadowImageView?.isHidden = true
        
        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillShow), name: NSNotification.Name.UIKeyboardWillShow, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillHide), name: NSNotification.Name.UIKeyboardWillHide, object: nil)
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        shadowImageView?.isHidden = false
        NotificationCenter.default.removeObserver(self)
    }

    override func viewDidLoad() {
        super.viewDidLoad()

//        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillShow), name: NSNotification.Name.UIKeyboardWillShow, object: nil)
//        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillHide), name: NSNotification.Name.UIKeyboardWillHide, object: nil)

        
//        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillShow), name: NSNotification.Name.UIKeyboardWillShow, object: nil)
//        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillHide), name: NSNotification.Name.UIKeyboardWillHide, object: nil)

        
        self.loginButton.layer.cornerRadius = 3
        self.loginButton.layer.shadowColor = UIColor.gray.cgColor
        self.loginButton.layer.shadowOpacity = 1
        self.loginButton.layer.shadowOffset = CGSize(width: 0, height: 2.0)
        self.loginButton.layer.shadowRadius = 4.0
        self.loginButton.layer.masksToBounds = false

        self.signupButton.layer.cornerRadius = 5
        self.signupButton.layer.shadowColor = UIColor.gray.cgColor
        self.signupButton.layer.shadowOpacity = 1
        self.signupButton.layer.shadowOffset = CGSize(width: 0, height: 2.0)
        self.signupButton.layer.shadowRadius = 4.0
        self.signupButton.layer.masksToBounds = false
        
        activityIndicator = Utilities.addActivityIndicator(to: self.view)
        
        
        let tapGestureRecognizer = UITapGestureRecognizer(target:self, action:#selector(LoginViewController.onTapingOutTextfields))
        self.view.addGestureRecognizer(tapGestureRecognizer)
        self.view.isUserInteractionEnabled = true
        
        self.fbloginButton = FBSDKLoginButton()
        let y = Constants.facebookButtonBottomMargin
        fbloginButton.frame = CGRect(x: Constants.facebookButtonLeftRightMargin, y: y,
                                   width: view.frame.width - 2 * Constants.facebookButtonLeftRightMargin,
                                   height: Constants.facebookButtonHeight)
        fbloginButton.delegate = self
        fbloginButton.readPermissions = ["email", "public_profile"]
        
        view.addSubview(fbloginButton)
        
        // add blur effect
        let blurEffect = UIBlurEffect(style: UIBlurEffectStyle.light)
        let blurEffectView = UIVisualEffectView(effect: blurEffect)
        blurEffectView.frame = loginView.bounds
        blurEffectView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        loginView.addSubview(blurEffectView)
        
        // format navigation bar
        self.navigationController?.navigationBar.backgroundColor = UIColor.clear
        self.navigationController?.navigationBar.tintColor = UIColor.lightGray
    }
    
    func keyboardWillShow(sender: NSNotification) {
        if(!keyboardPrecense){
            self.view.frame.origin.y -= 180
            keyboardPrecense = true
        }

    }
    func keyboardWillHide(sender: NSNotification) {
        self.view.frame.origin.y += 180
        keyboardPrecense = false
    }
    
//    func keyboardWillHide(sender: NSNotification) {
//        let userInfo: [NSObject : AnyObject] = sender.userInfo! as [NSObject : AnyObject]
//        let keyboardSize: CGSize = ((sender.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue.size)!
//        self.view.frame.origin.y += keyboardSize.height
//    }
//    
//    func keyboardWillShow(sender: NSNotification) {
//        let userInfo: [NSObject : AnyObject] = sender.userInfo! as [NSObject : AnyObject]
//        let keyboardSize: CGSize = ((sender.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue.size)!
//        let offset: CGSize = ((sender.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue.size)!
//        
//        if keyboardSize.height == offset.height {
//            UIView.animate(withDuration: 0.1, animations: { () -> Void in
//                self.view.frame.origin.y -= keyboardSize.height
//            })
//        } else {
//            UIView.animate(withDuration: 0.1, animations: { () -> Void in
//                self.view.frame.origin.y += keyboardSize.height - offset.height
//            })
//        }
//    }
    
//    func keyboardWillShow(notification: NSNotification) {
//        
//        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
//            if self.view.frame.origin.y == 0{
//                self.view.frame.origin.y -= keyboardSize.height
//            }
//        }
//        
//    }
//    
//    func keyboardWillHide(notification: NSNotification) {
//        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
//            if self.view.frame.origin.y != 0{
//                self.view.frame.origin.y += keyboardSize.height
//            }
//        }
//    }
    
    
//    func keyboardWillShow(notification: NSNotification) {
//        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
//            if self.view.frame.origin.y == 0{
//                self.view.frame.origin.y -= (keyboardSize.height)
//            }
//        }
//        
//    }
//    
//    func keyboardWillHide(notification: NSNotification) {
//        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
//            if self.view.frame.origin.y != 0{
//                self.view.frame.origin.y += (keyboardSize.height)
//            }
//        }
//    }
    
    func showOptionalLogin(show: Bool){
        if show {
            self.ordividerView.isHidden = false
            self.fbloginButton.isHidden = false
        } else {
            self.ordividerView.isHidden = true
            self.fbloginButton.isHidden = true
        }
    }
    
    func onTapingOutTextfields(){
        print("~~~~~~~~~~~ tapping out text fields ~~~~~~~~~~~~")
        self.view.endEditing(true)
        //if(self.shiftedUp){
            //animateViewMoving(up: false, moveValue: CGFloat(shifitngValue))
            //shiftedUp = false
            //showOptionalLogin(show: true)
        //}
    }
//
//    @IBAction func onTappingOntextFields(_ sender: Any) {
//        if (!self.shiftedUp) {
//            shiftedUp = true
//            print("^^^^^^^^^^^^^^^^^^^^^^^shifiting up^^^^^^^^^^^Password field")
//            animateViewMoving(up: true, moveValue: CGFloat(shifitngValue))
//            showOptionalLogin(show: false)
//        } else {
//            print("===================is already shifted up=============Password field")
//        }
//    }
//    
//    @IBAction func onTapingOntextFields(_ sender: Any) {
//        if (!self.shiftedUp) {
//            shiftedUp = true
//            print("^^^^^^^^^^^^^^^^^^^^^^^shifiting up^^^^^^^^^^^User field")
//            animateViewMoving(up: true, moveValue: CGFloat(shifitngValue))
//            showOptionalLogin(show: false)
//        } else {
//            print("===================is already shifted up========User field")
//        }
//    }
//
//    func animateViewMoving (up:Bool, moveValue :CGFloat){
//        let movementDuration:TimeInterval = 0.4
//        let movement:CGFloat = ( up ? -moveValue : moveValue)
//        
//        UIView.beginAnimations("animateView", context: nil)
//        UIView.setAnimationBeginsFromCurrentState(true)
//        UIView.setAnimationDuration(movementDuration)
//        
//        self.userpassloginView.frame = self.userpassloginView.frame.offsetBy(dx: 0, dy: movement)
//        UIView.commitAnimations()
//    }
    
    
    @IBAction func onFastcartLogin(_ sender: Any) {
        let username = self.usernameLabel.text
        let password = self.passwordLabel.text
        activityIndicator.startAnimating()
        PFUser.logInWithUsername (inBackground: username!, password: password!, block: {(user, error) in
            self.activityIndicator.stopAnimating()
            if user != nil {
                //Yes User Exists
                print(user ?? "default message of user logged in")
                let userDictionary = User.getUserDictionary(user: user!)
                let storedUser = User(dictionary: userDictionary)
                storedUser.loginMethod = "parse"
                User.currentUser = storedUser
                
                self.performSegue(withIdentifier: "successloginsegue", sender: nil)

            }
            else {
                let alertController = UIAlertController(title: "Login Failed", message: "Incorrect password or username", preferredStyle: .alert)
                alertController.addAction(UIAlertAction(title: "Try Again", style: UIAlertActionStyle.cancel, handler: nil))
                self.present(alertController, animated: true, completion: nil)
            }
        })
    }
    
    
    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        NotificationCenter.default.post(name: User.userDidLogoutNotification, object: self)
    }
    
    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if error != nil {
            print(error)
            return
        }
        
        FBSDKGraphRequest(graphPath: "/me", parameters: ["fields" : "id, name, email"]).start { (connecion, result, error) in
            if error != nil {
                print("failed to start graph")
                print(error?.localizedDescription ?? "undefined error")
                return
            }
        
            self.dict = result as! NSDictionary
            DispatchQueue.main.async {
                self.onSignUp(username: self.dict["name"] as! String, email: self.dict["email"] as! String, password: "password", id: self.dict["id"] as! String)
            }
        }
    }
    
    @IBAction func onBackSignUp(_ sender: Any) {
        self.dismiss(animated: true, completion: ({}))
    }
    
    func onSignUp(username: String, email: String, password: String, id: String) {
        
        let query = PFQuery(className: "AppUsers")
        query.whereKey("email", equalTo: email)
        
        _ = query.findObjectsInBackground{
            (users: [PFObject]?, error: Error?) -> Void in
            if error == nil {
                if users != nil{
                    if (users?.count)! > 0 {
                        //login
                        //var storeUser = User.getParseUser(email: email)
                      
                        let rawUser = users?[0]
                        print(rawUser ?? "printing default rawuser")
                        let userDictionary = User.getUserDictionary(user: rawUser!)
                        let storedUser = User(dictionary: userDictionary)
                        storedUser.loginMethod = "facebook"
                        User.currentUser = storedUser
                        print("user login")
                    
                    }
                    else {
                        //sign up
                        print("user signup")
                        
                        let user = PFObject(className: "AppUsers")
                        user["unsername"] = username
                        user["email"] = email
                        user["facebookId"] = id
                        user.saveInBackground { (succeeded:Bool, error:Error?) in
                            if(succeeded){
                                print("saved with id: \(user.objectId)")
                                
                                let userDic = User.getUserDictionary(user: user)
                                let user = User(dictionary: userDic)
                                user.loginMethod = "facebook"
                                User.currentUser = user
                                
                            } else {
                                print("failed to send message")
                                //print(error?.localizedDescription)
                            }
                        }
                    }
                }
                
            } else {
                print("some went wrong")
            }
            
            self.performSegue(withIdentifier: "successloginsegue", sender: nil)
        }
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        guard let vc = segue.destination as? UITabBarController else { return }
        vc.customInitialize()
    }
}
