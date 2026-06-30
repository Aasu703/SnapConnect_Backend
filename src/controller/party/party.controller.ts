
import { Request, Response } from "express";
import { Party } from "../../models/party.model";
import { PartyMember } from "../../models/partyMember.model";
import { Album } from "../../models/album.model";
import { Photo } from "../../models/photo.model";

export class PartyController {
    async createParty(req: Request, res: Response) {
        try {
            const party = await Party.create(req.body);
            return res.status(201).json({ success: true, data: party });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getParty(req: Request, res: Response) {
        try {
            const party = await Party.findById(req.params.id);
            if (!party) return res.status(404).json({ success: false, message: "Party not found" });
            
            const memberCount = await PartyMember.countDocuments({ party_id: party.id });
            const partyData = party.toJSON();
            partyData.member_count = memberCount;
            
            return res.status(200).json({ success: true, data: partyData });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPartyByJoinCode(req: Request, res: Response) {
        try {
            const party = await Party.findOne({ join_code: req.params.code });
            if (!party) return res.status(404).json({ success: false, message: "Party not found" });
            
            const memberCount = await PartyMember.countDocuments({ party_id: party.id });
            const partyData = party.toJSON();
            partyData.member_count = memberCount;

            return res.status(200).json({ success: true, data: partyData });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async joinParty(req: Request, res: Response) {
        try {
            const { party_id, user_id, user_name } = req.body;
            
            let member = await PartyMember.findOne({ party_id, user_id });
            if (!member) {
                member = await PartyMember.create({ party_id, user_id, user_name });
            }
            
            return res.status(200).json({ success: true, data: member });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getHostParties(req: Request, res: Response) {
        try {
            const parties = await Party.find({ host_id: req.params.userId });
            return res.status(200).json({ success: true, data: parties });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getJoinedParties(req: Request, res: Response) {
        try {
            const members = await PartyMember.find({ user_id: req.params.userId });
            const partyIds = members.map(m => m.party_id);
            const parties = await Party.find({ _id: { $in: partyIds } });
            return res.status(200).json({ success: true, data: parties });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
