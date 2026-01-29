/* eslint-disable */
import * as _m0 from "https://esm.sh/protobufjs@7.2.4/minimal";

export const protobufPackage = "recycle";

// --- INTERFACES ---

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  token?: string;
  userId?: string;
  error?: string;
}

export interface ProfileRequest {
  userId?: string;
}

export interface ProfileResponse {
  id?: string;
  fullName?: string;
  role?: string;
}

export interface TransactionRequest {
  userId?: string;
  wasteTypeId?: string;
  weight?: number;
}

export interface TransactionResponse {
  status?: string;
  message?: string;
  totalPrice?: number;
}

export interface WasteType {
  id?: string;
  name?: string;
  pricePerKg?: number;
}

export interface WasteTypeList {
  items: WasteType[];
}

function createBaseLoginRequest(): LoginRequest {
  return { email: "", password: "" };
}

export const LoginRequest = {
  encode(message: LoginRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.email !== undefined && message.email !== "") {
      writer.uint32(10).string(message.email);
    }
    if (message.password !== undefined && message.password !== "") {
      writer.uint32(18).string(message.password);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LoginRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLoginRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.email = reader.string();
          break;
        case 2:
          message.password = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

function createBaseLoginResponse(): LoginResponse {
  return { token: "", userId: "", error: "" };
}

export const LoginResponse = {
  encode(message: LoginResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== undefined && message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.userId !== undefined && message.userId !== "") {
      writer.uint32(18).string(message.userId);
    }
    if (message.error !== undefined && message.error !== "") {
      writer.uint32(26).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LoginResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLoginResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        case 2:
          message.userId = reader.string();
          break;
        case 3:
          message.error = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

function createBaseProfileRequest(): ProfileRequest {
  return { userId: "" };
}

export const ProfileRequest = {
  encode(message: ProfileRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userId !== undefined && message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProfileRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfileRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

function createBaseProfileResponse(): ProfileResponse {
  return { id: "", fullName: "", role: "" };
}

export const ProfileResponse = {
  encode(message: ProfileResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined && message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.fullName !== undefined && message.fullName !== "") {
      writer.uint32(18).string(message.fullName);
    }
    if (message.role !== undefined && message.role !== "") {
      writer.uint32(26).string(message.role);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ProfileResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProfileResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.fullName = reader.string();
          break;
        case 3:
          message.role = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

function createBaseTransactionRequest(): TransactionRequest {
  return { userId: "", wasteTypeId: "", weight: 0 };
}

export const TransactionRequest = {
  encode(message: TransactionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.userId !== undefined && message.userId !== "") {
      writer.uint32(10).string(message.userId);
    }
    if (message.wasteTypeId !== undefined && message.wasteTypeId !== "") {
      writer.uint32(18).string(message.wasteTypeId);
    }
    if (message.weight !== undefined && message.weight !== 0) {
      writer.uint32(29).float(message.weight);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TransactionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.userId = reader.string();
          break;
        case 2:
          message.wasteTypeId = reader.string();
          break;
        case 3:
          message.weight = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

function createBaseTransactionResponse(): TransactionResponse {
  return { status: "", message: "", totalPrice: 0 };
}

export const TransactionResponse = {
  encode(message: TransactionResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== undefined && message.status !== "") {
      writer.uint32(10).string(message.status);
    }
    if (message.message !== undefined && message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.totalPrice !== undefined && message.totalPrice !== 0) {
      writer.uint32(29).float(message.totalPrice);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TransactionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransactionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.string();
          break;
        case 2:
          message.message = reader.string();
          break;
        case 3:
          message.totalPrice = reader.float();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

function createBaseWasteType(): WasteType {
  return { id: "", name: "", pricePerKg: 0 };
}

export const WasteType = {
  encode(message: WasteType, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined && message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== undefined && message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.pricePerKg !== undefined && message.pricePerKg !== 0) {
      writer.uint32(29).float(message.pricePerKg);
    }
    return writer;
  },
};

function createBaseWasteTypeList(): WasteTypeList {
  return { items: [] };
}

export const WasteTypeList = {
  encode(message: WasteTypeList, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.items) {
      WasteType.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
};