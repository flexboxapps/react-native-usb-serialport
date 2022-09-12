import { createServer, createConnection, Server, Socket } from "../src/index";

export interface IDevice {
  name: string;
  vendorId: number;
  productId: number;
}

export type Devices = Array<IDevice> | null;

export interface IOnReadData {
  payload: string | Array<number>;
}
export interface IOnError {
  status: boolean;
  errorCode: number;
  errorMessage: string;
  exceptionErrorMessage?: string;
}
export interface IOnServiceStarted {
  deviceAttached: boolean;
}

interface DefinitionsStatic {
  DATA_BITS: {
    DATA_BITS_5: number;
    DATA_BITS_6: number;
    DATA_BITS_7: number;
    DATA_BITS_8: number;
  };
  STOP_BITS: {
    STOP_BITS_1: number;
    STOP_BITS_15: number;
    STOP_BITS_2: number;
  };
  PARITIES: {
    PARITY_NONE: number;
    PARITY_ODD: number;
    PARITY_EVEN: number;
    PARITY_MARK: number;
    PARITY_SPACE: number;
  };
  FLOW_CONTROLS: {
    FLOW_CONTROL_OFF: number;
    FLOW_CONTROL_RTS_CTS: number;
    FLOW_CONTROL_DSR_DTR: number;
    FLOW_CONTROL_XON_XOFF: number;
  };
  RETURNED_DATA_TYPES: {
    INTARRAY: number;
    HEXSTRING: number;
  };
  DRIVER_TYPES: {
    AUTO: string;
    CDC: string;
    CH34x: string;
    CP210x: string;
    FTDI: string;
    PL2303: string;
  };
}
export var definitions: DefinitionsStatic;

interface ActionsStatic {
  ON_SERVICE_STARTED: string;
  ON_SERVICE_STOPPED: string;
  ON_DEVICE_ATTACHED: string;
  ON_DEVICE_DETACHED: string;
  ON_ERROR: string;
  ON_CONNECTED: string;
  ON_DISCONNECTED: string;
  ON_READ_DATA: string;
}
export var actions: ActionsStatic;

type DataBits = 5 | 6 | 7 | 8;
type StopBits = 1 | 2 | 3;
type Parities = 0 | 1 | 2 | 3 | 4;
type FlowControls = 0 | 1 | 2 | 3;
type ReturnedDataTypes = 1 | 2;
type Drivers = "AUTO" | "cdc" | "ch34x" | "cp210x" | "ftdi" | "pl2303";

interface RNSerialportStatic {
  /**
   * Starts the service and Usb listener
   *
   * @memberof RNSerialportStatic
   */
  startUsbService(): void;
  /**
   * Stops the service and Usb listener
   *
   * @memberof RNSerialportStatic
   */
  stopUsbService(): void;

  /**
   *  @ReactMethod
   *  public void setIsNativeGateway(final boolean isNativeGw) {
   *    isNativeGateway = isNativeGw;
   *  }
   */
  setIsNativeGateway(isNativeGw: boolean): void;

  /**
   *  @ReactMethod
   *  public void setIsNativeGatewayJsEventEmitOnSerialportData(final boolean isJsEvent) {
   *    isNativeGatewayJsEventEmitOnSerialportData = isJsEvent;
   *  }
   */
  setIsNativeGatewayJsEventEmitOnSerialportData(isJsEvent: boolean): void;

  /**
   *  @ReactMethod
   *  public void appBus2DeviceNamePut(Integer appBus, String deviceName) {
   *    appBus2DeviceName.put(appBus, deviceName);
   *  }
   */
  appBus2DeviceNamePut(appBus: number, deviceName: string): void;

  /**
   * @ReactMethod
   * public void disconnectAllDevices() {
   * if(!usbServiceStarted){
   *   eventEmit(onErrorEvent, createError(Definitions.ERROR_USB_SERVICE_NOT_STARTED, Definitions.ERROR_USB_SERVICE_NOT_STARTED_MESSAGE));
   *   return;
   * }
   */
  disconnectAllDevices(): void;

  /**
   * @ReactMethod
   * public void writeBytes(String deviceName, ReadableArray message) {
   *   if(!usbServiceStarted){
   *     eventEmit(onErrorEvent, createError(Definitions.ERROR_USB_SERVICE_NOT_STARTED, Definitions.ERROR_USB_SERVICE_NOT_STARTED_MESSAGE));
   *     return;
   *   }
   *   UsbSerialDevice serialPort = serialPorts.get(deviceName);
   *   if(serialPort == null) {
   *     eventEmit(onErrorEvent, createError(Definitions.ERROR_THERE_IS_NO_CONNECTION, Definitions.ERROR_THERE_IS_NO_CONNECTION_MESSAGE));
   *     return;
   *   }
   *   int length = message.size();
   *   byte [] bytes = new byte[length];
   *   for (int i = 0; i < length; i++) {
   *     bytes[i] = (byte)message.getInt(i);
   *   }
   *   serialPort.write(bytes);
   * }
   */
  writeBytes(deviceName: string, message: any[]): void;

  /**
   * @ReactMethod
   * public void disconnectDevice(String deviceName) {
   *  if(!usbServiceStarted){
   *    eventEmit(onErrorEvent, createError(Definitions.ERROR_USB_SERVICE_NOT_STARTED, Definitions.ERROR_USB_SERVICE_NOT_STARTED_MESSAGE));
   *    return;
   *  }
   *
   *  if(!serialPorts.containsKey(deviceName)) {
   *    eventEmit(onErrorEvent, createError(Definitions.ERROR_SERIALPORT_ALREADY_DISCONNECTED, Definitions.ERROR_SERIALPORT_ALREADY_DISCONNECTED_MESSAGE));
   *    return;
   *  }
   *  stopConnection(deviceName);
   *  serialPorts.remove(deviceName);
   *
   */
  disconnectDevice(deviceName: string): void;

  /**
   * Returns status via Promise
   *
   * @returns {Promise<boolean>}
   * @memberof RNSerialportStatic
   */
  isOpen(): Promise<boolean>;

  /**
   * Returns status boolean via Promise
   *
   * @returns {Promise<boolean>}
   * @memberof RNSerialportStatic
   */
  isServiceStarted(): Promise<boolean>;

  /**
   * Returns support status
   *
   * @param {string} deviceName
   * @returns {Promise<boolean>}
   * @memberof RNSerialportStatic
   */
  isSupported(deviceName: string): Promise<boolean>;

  //Begin setter methods

  /**
   * Set the returned data type
   *
   * @param {ReturnedDataTypes} type
   * @memberof RNSerialportStatic
   */
  setReturnedDataType(type: ReturnedDataTypes): void;

  /**
   * Set the interface
   *
   * @param {number} iFace
   * @memberof RNSerialportStatic
   */
  setInterface(iFace: number): void;

  /**
   * Set the data bit
   *
   * @param {DataBits} bit
   * @memberof RNSerialportStatic
   */
  setDataBit(bit: DataBits): void;

  /**
   * Set the stop bit
   *
   * @param {StopBits} bit
   * @memberof RNSerialportStatic
   */
  setStopBit(bit: StopBits): void;

  /**
   * Set the parity
   *
   * @param {Parities} parity
   * @memberof RNSerialportStatic
   */
  setParity(parity: Parities): void;

  /**
   *  Set the flow control
   *
   * @param {FlowControls} control
   * @memberof RNSerialportStatic
   */
  setFlowControl(control: FlowControls): void;

  /**
   * Set the auto connection baudrate
   *
   * @param {number} baudRate
   * @memberof RNSerialportStatic
   */
  setAutoConnectBaudRate(baudRate: number): void;

  /**
   * Set the auto connection status
   *
   * @param {boolean} status
   * @memberof RNSerialportStatic
   */
  setAutoConnect(status: boolean): void;

  /**
   * Set the driver type
   *
   * @param {Drivers} driver
   * @memberof RNSerialportStatic
   */
  setDriver(driver: Drivers): void;

  //End setter methods

  /**
   * Load the default connection settings
   *
   * @memberof RNSerialportStatic
   */
  loadDefaultConnectionSetting(): void;

  /**
   * Returns the device list via Promise
   *
   * @returns {Promise<Devices>}
   * @memberof RNSerialportStatic
   */
  getDeviceList(): Promise<Devices>;

  /**
   * Connect to device with device name and baud rate
   *
   * @param {string} deviceName
   * @param {number} baudRate
   * @memberof RNSerialportStatic
   */
  connectDevice(deviceName: string, baudRate: number): void;

  /**
   * Closes the connection
   *
   * @memberof RNSerialportStatic
   */
  disconnect(): void;

  /**
   * Writes string to port
   *
   * @param {string} data
   * @memberof RNSerialportStatic
   */
  writeString(data: string): void;

  /**
   * Writes Base64 string to port
   *
   * @param {string} data
   * @memberof RNSerialportStatic
   */
  writeBase64(data: string): void;

  /**
   * Writes hex string to port
   *
   * @param {string} data
   * @memberof RNSerialportStatic
   */
  writeHexString(data: string): void;

  /**
   * Integer array convert to Utf16 string
   *
   * @param {Array<number>} intArray
   * @returns {string}
   * @memberof RNSerialportStatic
   */
  intArrayToUtf16(intArray: Array<number>): string;

  /**
   * Hex string convert to Utf16 string
   *
   * @param {string} hex
   * @returns {string}
   * @memberof RNSerialportStatic
   */
  hexToUtf16(hex: string): string;
}
export var RNSerialport: RNSerialportStatic;

export { createServer, createConnection, Server, Socket };
